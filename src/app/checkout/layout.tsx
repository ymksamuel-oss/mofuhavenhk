/** Checkout pages contain per-order and payment-session state; never cache them. */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
