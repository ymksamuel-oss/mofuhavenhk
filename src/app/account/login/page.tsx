import { AccountAuthCard, AccountAuthMessage } from "@/components/account/AccountAuthCard";
import { LoginForm } from "@/components/account/AccountAuthForms";
import { safeReturnPath } from "@/lib/account/redirects";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AccountLoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const returnValue = Array.isArray(params.returnTo) ? params.returnTo[0] : params.returnTo;
  const authError = Array.isArray(params.auth) ? params.auth[0] : params.auth;
  const returnTo = safeReturnPath(returnValue, "/account");
  const messageKey = authError === "unavailable"
    ? "accountServiceUnavailable"
    : authError === "oauth_error" || authError === "callback_error"
      ? "accountGenericError"
      : null;
  return (
    <AccountAuthCard titleKey="accountLoginTitle" descriptionKey="accountLoginDescription">
      {messageKey ? <AccountAuthMessage messageKey={messageKey} /> : null}
      <LoginForm returnTo={returnTo} />
    </AccountAuthCard>
  );
}
