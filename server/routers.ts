import { z } from "zod";
import Stripe from "stripe";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { listStoreProducts } from "./stripeProducts";
import { filterCatalogProducts, normalizeRequestedCategory } from "../shared/productCatalog";

// 完整支援 Visa, Mastercard, JCB, AMEX (透過 card 類型自動支援), Alipay/AlipayHK (alipay)，並可透過環境變數開啟 WeChat Pay
const checkoutPaymentMethods: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] = ["card", "alipay"];
const wechatPayEnabled = process.env.STRIPE_ENABLE_WECHAT_PAY === "true";
if (wechatPayEnabled) {
  checkoutPaymentMethods.push("wechat_pay");
}

const checkoutPaymentMethodOptions: Stripe.Checkout.SessionCreateParams.PaymentMethodOptions = {
  card: { request_three_d_secure: "any" },
  ...(wechatPayEnabled ? { wechat_pay: { client: "web" } } : {}),
};

function isWeChatPayUnavailable(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /wechat_pay|wechat pay/i.test(message) && /invalid|activated|enabled/i.test(message);
}

function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_LIVE_SECRET_KEY ?? process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Stripe is not configured. Add the Stripe connection in Settings → Payment.");
  }

  return new Stripe(secretKey);
}

const productQueryInput = z.object({
  category: z.string().trim().max(40).optional(),
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
        delivery: z.object({
          recipientName: z.string().trim().min(2).max(80),
          contactPhone: z.string().trim().regex(/^(?:\+852)?[2-9]\d{7}$/, "請輸入有效的香港電話號碼。"),
          deliveryMethod: z.enum(["home_delivery", "sf_station", "smart_locker"]),
          pickupCode: z.string().trim().max(80).optional(),
        }).superRefine((delivery, ctx) => {
          if (delivery.deliveryMethod !== "home_delivery" && !delivery.pickupCode) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["pickupCode"], message: "選擇自取方式時必須提供站點或櫃點資料。" });
          }
        }),
      }))
      .mutation(async ({ input, ctx }) => {
        const stripe = getStripeClient();
        const prices = await Promise.all(input.items.map((item) => stripe.prices.retrieve(item.priceId)));
        const invalidPrice = prices.find((price) => !price.active || price.currency.toLowerCase() !== "hkd");
        if (invalidPrice) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "購物車內有未啟用或非 HKD 商品，請重新整理後再試。" });
        }

        const origin = ctx.req.headers.origin ?? `${ctx.req.protocol}://${ctx.req.get("host")}`;
        const sessionParams: Stripe.Checkout.SessionCreateParams = {
          mode: "payment",
          submit_type: "pay",
          line_items: input.items.map((item) => ({ price: item.priceId, quantity: item.quantity })),
          payment_method_types: checkoutPaymentMethods,
          payment_method_options: checkoutPaymentMethodOptions,
          metadata: {
            recipient_name: input.delivery.recipientName,
            contact_phone: input.delivery.contactPhone,
            delivery_method: input.delivery.deliveryMethod,
            ...(input.delivery.pickupCode ? { pickup_code: input.delivery.pickupCode } : {}),
          },
          allow_promotion_codes: true,
          success_url: `${origin}/checkout/return?status=success&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/checkout/return?status=cancelled`,
        };
        let session: Stripe.Checkout.Session;
        try {
          session = await stripe.checkout.sessions.create(sessionParams);
        } catch (error) {
          if (!wechatPayEnabled || !isWeChatPayUnavailable(error)) throw error;
          console.warn("[Stripe Checkout] WeChat Pay is not enabled for this account; retrying with card and Alipay.");
          session = await stripe.checkout.sessions.create({
            ...sessionParams,
            payment_method_types: ["card", "alipay"],
            payment_method_options: { card: { request_three_d_secure: "any" } },
          });
        }

        if (!session.url) {
          throw new Error("Stripe did not return a checkout URL.");
        }

        return { url: session.url };
      }),
  }),
});

export type AppRouter = typeof appRouter;
