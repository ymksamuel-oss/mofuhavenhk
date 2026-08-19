import { z } from "zod";
import Stripe from "stripe";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { listStoreProducts } from "./stripeProducts";
import { filterCatalogProducts, normalizeRequestedCategory } from "../shared/productCatalog";

function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_LIVE_SECRET_KEY ?? process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Stripe is not configured. Add the Stripe connection in Settings → Payment.");
  }

  return new Stripe(secretKey);
}

const productQueryInput = z.object({
  category: z.enum(["all", "cats", "dogs", "treats", "wet-cans", "toys", "supplements", "small-pets", "cleaning", "deals", "bestsellers", "outdoor"]).optional(),
  q: z.string().trim().max(120).optional(),
}).optional();

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  store: router({
    products: publicProcedure.input(productQueryInput).query(async ({ input }) => {
      const result = await listStoreProducts(getStripeClient());
      const category = normalizeRequestedCategory(input?.category);
      const query = input?.q ?? "";
      const products = filterCatalogProducts(result.products, category, query);

      return {
        products,
        total: products.length,
        totalAvailable: result.products.length,
        source: result.source,
        filter: { category, q: query },
      };
    }),
    checkout: publicProcedure
      .input(z.object({
        items: z.array(z.object({ priceId: z.string().min(1), quantity: z.number().int().min(1).max(99) })).min(1).max(99),
      }))
      .mutation(async ({ input, ctx }) => {
        const stripe = getStripeClient();
        const prices = await Promise.all(input.items.map((item) => stripe.prices.retrieve(item.priceId)));
        const invalidPrice = prices.find((price) => !price.active || price.currency.toLowerCase() !== "hkd");
        if (invalidPrice) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "購物車內有未啟用或非 HKD 商品，請重新整理後再試。" });
        }

        const origin = ctx.req.headers.origin ?? `${ctx.req.protocol}://${ctx.req.get("host")}`;
        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          line_items: input.items.map((item) => ({ price: item.priceId, quantity: item.quantity })),
          shipping_address_collection: { allowed_countries: ["HK"] },
          phone_number_collection: { enabled: true },
          allow_promotion_codes: true,
          success_url: `${origin}/checkout/return?status=success&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/checkout/return?status=cancelled`,
        });

        if (!session.url) {
          throw new Error("Stripe did not return a checkout URL.");
        }

        return { url: session.url };
      }),
  }),
});

export type AppRouter = typeof appRouter;
