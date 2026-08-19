import { z } from "zod";
import Stripe from "stripe";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { listStoreProducts } from "./stripeProducts";
import { filterCatalogProducts, normalizeRequestedCategory } from "../shared/productCatalog";

function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
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
      .input(z.object({ priceId: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        const stripe = getStripeClient();
        const origin = ctx.req.headers.origin ?? `${ctx.req.protocol}://${ctx.req.get("host")}`;
        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          line_items: [{ price: input.priceId, quantity: 1 }],
          allow_promotion_codes: true,
          success_url: `${origin}/?checkout=success`,
          cancel_url: `${origin}/?checkout=cancelled`,
        });

        if (!session.url) {
          throw new Error("Stripe did not return a checkout URL.");
        }

        return { url: session.url };
      }),
  }),
});

export type AppRouter = typeof appRouter;
