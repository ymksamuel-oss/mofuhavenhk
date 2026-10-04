import Link from "next/link";
import { AccountAuthCard } from "@/components/account/AccountAuthCard";
import { ForgotPasswordForm } from "@/components/account/AccountAuthForms";

export default function ForgotPasswordPage() {
  return (
    <AccountAuthCard title="重設密碼" description="輸入註冊 Email；如帳戶存在，我們會寄出安全重設連結。">
      <ForgotPasswordForm />
      <p className="text-center text-sm"><Link href="/account/login" className="font-medium text-[color:var(--accent)] underline-offset-4 hover:underline">返回登入</Link></p>
    </AccountAuthCard>
  );
}
