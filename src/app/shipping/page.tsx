import { redirect } from "next/navigation";

/** Legacy `/shipping` → canonical shipping policy. */
export default function ShippingPage() {
  redirect("/shipping-policy");
}
