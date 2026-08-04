import type { Metadata } from "next";
import { ReceiptPage } from "@/components/ReceiptPage";

export const metadata: Metadata = {
  title: "訂單收據｜Mofu Haven",
  description: "查看 Mofu Haven 訂單收據與明細。",
};

export default async function ReceiptRoutePage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  return <ReceiptPage orderNumber={orderNumber} />;
}
