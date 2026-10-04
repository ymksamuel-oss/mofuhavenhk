import { AccountAuthCard } from "@/components/account/AccountAuthCard";
import { SignupForm } from "@/components/account/AccountAuthForms";
import { safeReturnPath } from "@/lib/account/redirects";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AccountSignupPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const getOne = (key: string) => Array.isArray(params[key]) ? params[key]?.[0] : params[key];
  return (
    <AccountAuthCard title="建立會員帳戶" description="完成 Email 驗證後，即可查看已用相同 Email 下單的歷史訂單。">
      <SignupForm email={typeof getOne("email") === "string" ? getOne("email") as string : ""} displayName={typeof getOne("displayName") === "string" ? getOne("displayName") as string : ""} returnTo={safeReturnPath(getOne("returnTo"), "/account")} />
    </AccountAuthCard>
  );
}
