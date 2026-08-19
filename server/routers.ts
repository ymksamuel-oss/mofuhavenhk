import { z } from "zod";
import Stripe from "stripe";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { listStoreProducts } from "./stripeProducts";

function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Stripe is not configured. Add the Stripe connection in Settings → Payment.");
  }

  return new Stripe(secretKey);
}

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
    products: publicProcedure.query(async () => {
      const result = await listStoreProducts(getStripeClient());
      return {
        products: result.products,
        total: result.products.length,
        source: result.source,
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
