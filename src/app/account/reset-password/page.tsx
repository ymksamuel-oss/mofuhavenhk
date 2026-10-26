import { AccountAuthCard } from "@/components/account/AccountAuthCard";
import { ResetPasswordForm } from "@/components/account/AccountAuthForms";

export default function ResetPasswordPage() {
  return (
    <AccountAuthCard titleKey="accountResetTitle" descriptionKey="accountResetDescription">
      <ResetPasswordForm />
    </AccountAuthCard>
  );
}
