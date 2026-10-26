import { AccountAuthCard, AccountAuthLink } from "@/components/account/AccountAuthCard";
import { ForgotPasswordForm } from "@/components/account/AccountAuthForms";

export default function ForgotPasswordPage() {
  return (
    <AccountAuthCard titleKey="accountForgotTitle" descriptionKey="accountForgotDescription">
      <ForgotPasswordForm />
      <p className="text-center text-sm"><AccountAuthLink href="/account/login" labelKey="accountBackToLogin" /></p>
    </AccountAuthCard>
  );
}
