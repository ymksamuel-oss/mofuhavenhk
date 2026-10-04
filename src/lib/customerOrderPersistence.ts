import { getSupabaseAdmin } from "@/lib/supabase";

type PersistHostedOrderInput = {
  orderNumber: string;
  checkoutSessionId: string;
  paymentIntentId?: string | null;
  customerInfo: Record<string, string>;
  items: Array<Record<string, unknown>>;
  total: number;
};

async function bestEffort(operation: () => Promise<void>, description: string): Promise<void> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const task = (async () => {
    try {
      await operation();
    } catch (error) {
      console.warn(`[orders] ${description} failed`, error instanceof Error ? error.message : "unknown error");
    }
  })();
  await Promise.race([
    task,
    new Promise<void>((resolve) => {
      timeout = setTimeout(resolve, 1800);
    }),
  ]);
  if (timeout) clearTimeout(timeout);
}

/**
 * Store the validated hosted-checkout order before the customer leaves for Stripe.
 * This is deliberately best-effort: an order DB outage must never block checkout.
 */
export async function persistHostedCheckoutOrder(input: PersistHostedOrderInput): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  await bestEffort(async () => {
    const { error } = await supabase.from("orders").insert({
      customer_info: input.customerInfo,
      items: input.items,
      total: input.total,
      status: "pending",
      payment_intent_id: input.paymentIntentId ?? null,
      order_number: input.orderNumber,
      stripe_checkout_session_id: input.checkoutSessionId,
    });
    if (error) throw error;
  }, "hosted checkout order persistence");
}

/** Mark only still-pending orders as processing after Stripe confirms payment. */
export async function markCustomerOrderProcessing(
  orderNumber: string,
  paymentIntentId: string,
  paymentMethodLabel?: string,
): Promise<void> {
  const safeOrderNumber = orderNumber.trim().slice(0, 60);
  const safePaymentIntentId = paymentIntentId.trim().slice(0, 255);
  if (!safeOrderNumber || !safePaymentIntentId) return;
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  await bestEffort(async () => {
    const { error } = await supabase.from("orders")
      .update({
        status: "processing",
        payment_intent_id: safePaymentIntentId,
        ...(paymentMethodLabel?.trim() ? { payment_method_label: paymentMethodLabel.trim().slice(0, 80) } : {}),
      })
      .eq("order_number", safeOrderNumber)
      .eq("status", "pending");
    if (error) throw error;
  }, "paid order status update");
}
