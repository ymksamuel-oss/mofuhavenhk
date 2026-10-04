import { AccountAuthCard } from "@/components/account/AccountAuthCard";
import { LoginForm } from "@/components/account/AccountAuthForms";
import { safeReturnPath } from "@/lib/account/redirects";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AccountLoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const returnValue = Array.isArray(params.returnTo) ? params.returnTo[0] : params.returnTo;
  const authError = Array.isArray(params.auth) ? params.auth[0] : params.auth;
  const returnTo = safeReturnPath(returnValue, "/account");
  const message = authError === "unavailable"
    ? "會員登入服務尚未設定完成。請先設定 Supabase Auth 網址與公開金鑰。"
    : authError === "oauth_error" || authError === "callback_error"
      ? "登入驗證未完成，請再試一次。"
      : null;
  return (
    <AccountAuthCard title="會員登入" description="登入後查看訂單、配送地址及毛孩檔案。">
      {message ? <p role="alert" className="rounded-xl bg-amber-50 px-3.5 py-3 text-sm text-amber-900">{message}</p> : null}
      <LoginForm returnTo={returnTo} />
    </AccountAuthCard>
  );
}
