import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CheckoutDeliveryDetails, DeliveryMethod } from "@shared/cart";
import { useEffect, useState, type FormEvent } from "react";

const initialForm: CheckoutDeliveryDetails = {
  recipientName: "",
  contactPhone: "",
  deliveryMethod: "home_delivery",
  pickupCode: "",
};

function validate(form: CheckoutDeliveryDetails) {
  const errors: Partial<Record<keyof CheckoutDeliveryDetails, string>> = {};
  const phone = form.contactPhone.replace(/[\s-]/g, "");

  if (form.recipientName.trim().length < 2) errors.recipientName = "請輸入收件人姓名。";
  if (!/^(?:\+852)?[2-9]\d{7}$/.test(phone)) errors.contactPhone = "請輸入有效的香港電話號碼。";
  if (form.deliveryMethod !== "home_delivery" && !form.pickupCode?.trim()) {
    errors.pickupCode = form.deliveryMethod === "sf_station" ? "請輸入順豐站編號或名稱。" : "請輸入智能櫃點碼。";
  }
  return errors;
}

export default function CheckoutDetailsDialog({
  open,
  onOpenChange,
  isPending,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  onSubmit: (details: CheckoutDeliveryDetails) => Promise<void>;
}) {
  const [form, setForm] = useState<CheckoutDeliveryDetails>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutDeliveryDetails, string>>>({});

  useEffect(() => {
    if (open) {
      setForm(initialForm);
      setErrors({});
    }
  }, [open]);

  const update = <K extends keyof CheckoutDeliveryDetails>(key: K, value: CheckoutDeliveryDetails[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    await onSubmit({
      recipientName: form.recipientName.trim(),
      contactPhone: form.contactPhone.trim(),
      deliveryMethod: form.deliveryMethod,
      pickupCode: form.pickupCode?.trim() || undefined,
    });
  };

  const pickupLabel = form.deliveryMethod === "sf_station" ? "順豐站編號／名稱" : "智能櫃點碼";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto !overflow-y-auto [-webkit-overflow-scrolling:touch] [touch-action:pan-y] border-[#B88A58]/25 bg-[#FFFDF9] jp-card-shadow sm:max-w-lg pb-14">
        <DialogHeader className="pr-8 text-left">
          <DialogTitle className="text-[#736859]">填寫香港收貨資料</DialogTitle>
          <DialogDescription>提交後才會進入 Stripe 付款頁；Stripe 不會重複要求輸入送貨地址。</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pb-6" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="recipient-name" className="text-sm font-medium text-foreground">收件人姓名</label>
            <input id="recipient-name" value={form.recipientName} onChange={(event) => update("recipientName", event.target.value)} autoComplete="name" className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none transition focus:border-[#B88A58] focus:ring-2 focus:ring-[#B88A58]/20" placeholder="例如：陳小姐" />
            {errors.recipientName && <p className="text-xs text-destructive">{errors.recipientName}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="contact-phone" className="text-sm font-medium text-foreground">聯絡電話</label>
            <input id="contact-phone" value={form.contactPhone} onChange={(event) => update("contactPhone", event.target.value)} autoComplete="tel" inputMode="tel" className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none transition focus:border-[#B88A58] focus:ring-2 focus:ring-[#B88A58]/20" placeholder="例如：9123 4567" />
            {errors.contactPhone && <p className="text-xs text-destructive">{errors.contactPhone}</p>}
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-foreground">送貨方式</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {([
                ["home_delivery", "送貨上門"],
                ["sf_station", "順豐站"],
                ["smart_locker", "智能櫃"],
              ] as const).map(([value, label]) => (
                <label key={value} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-3 text-sm transition ${form.deliveryMethod === value ? "border-[#B88A58] bg-[#F7F3EE] text-[#6F5645]" : "border-border bg-white text-foreground"}`}>
                  <input type="radio" name="delivery-method" value={value} checked={form.deliveryMethod === value} onChange={() => update("deliveryMethod", value as DeliveryMethod)} className="accent-[#B88A58]" />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          {form.deliveryMethod !== "home_delivery" && (
            <div className="space-y-1.5">
              <label htmlFor="pickup-code" className="text-sm font-medium text-foreground">{pickupLabel}</label>
              <input id="pickup-code" value={form.pickupCode ?? ""} onChange={(event) => update("pickupCode", event.target.value)} autoComplete="off" className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none transition focus:border-[#B88A58] focus:ring-2 focus:ring-[#B88A58]/20" placeholder={form.deliveryMethod === "sf_station" ? "例如：SF12345" : "例如：Locker A-123"} />
              {errors.pickupCode && <p className="text-xs text-destructive">{errors.pickupCode}</p>}
            </div>
          )}

          <DialogFooter className="pt-2 sm:justify-start">
            <Button type="submit" disabled={isPending} className="w-full rounded-full bg-[#B88A58] text-white hover:bg-[#C2976B]">{isPending ? "準備安全付款頁…" : "確認資料並前往付款"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
