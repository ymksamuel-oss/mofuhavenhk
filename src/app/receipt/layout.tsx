/** Receipt content is order-specific and must remain outside shared caches. */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ReceiptLayout({ children }: { children: React.ReactNode }) {
  return children;
}
