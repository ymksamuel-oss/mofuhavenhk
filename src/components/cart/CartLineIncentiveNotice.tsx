import { getCartLineIncentive } from "@/lib/cart-line-incentive";
import type { OrderItem } from "@/lib/order";
import { useI18n } from "@/lib/i18n/I18nProvider";

type CartLineIncentiveNoticeProps = {
  item: OrderItem;
  className?: string;
};

export function CartLineIncentiveNotice({ item, className = "" }: CartLineIncentiveNoticeProps) {
  const { t } = useI18n();
  const incentive = getCartLineIncentive(item);
  if (!incentive) return null;

  return (
    <p className={`text-xs font-medium leading-5 text-[#8f4d27] ${className}`} role="note">
      {t(incentive.translationKey).replace("{count}", String(incentive.additionalQuantity))}
    </p>
  );
}
