import { AccountAuthCard } from "@/components/account/AccountAuthCard";
import { ResetPasswordForm } from "@/components/account/AccountAuthForms";

export default function ResetPasswordPage() {
  return (
    <AccountAuthCard title="設定新密碼" description="請設定至少 12 個字元的新密碼。重設連結只可使用一次。">
      <ResetPasswordForm />
    </AccountAuthCard>
  );
}
