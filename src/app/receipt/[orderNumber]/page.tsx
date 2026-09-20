import type { Metadata } from "next";
import { ReceiptPage } from "@/components/ReceiptPage";

export const metadata: Metadata = {
  title: "\u8a02\u55ae\u6536\u64da｜Mofu Haven",
  description: "\u67e5\u770b Mofu Haven \u8a02\u55ae\u6536\u64da\u8207\u660e\u7d30。",
};

export default async function ReceiptRoutePage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  return <ReceiptPage orderNumber={orderNumber} />;
}
