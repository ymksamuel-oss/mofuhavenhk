type PersistHostedOrderInput = {
  orderNumber: string;
  checkoutSessionId: string;
  paymentIntentId?: string | null;
  customerInfo: Record<string, string>;
  items: Array<Record<string, unknown>>;
  total: number;
};

/**
 * Static-catalog mode has no order database. The complete validated order is
 * attached to Stripe metadata; this no-op avoids calls to exhausted Supabase.
 */
export async function persistHostedCheckoutOrder(_input: PersistHostedOrderInput): Promise<void> {
  return;
}

/** Mark only still-pending orders as processing after Stripe confirms payment. */
export async function markCustomerOrderProcessing(
  _orderNumber: string,
  _paymentIntentId: string,
  _paymentMethodLabel?: string,
): Promise<void> {
  return;
}
