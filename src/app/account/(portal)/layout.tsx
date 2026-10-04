import { CustomerPortalShell } from "@/components/account/CustomerPortalShell";
import { requireCustomer, customerSummary } from "@/lib/account/server";

export const dynamic = "force-dynamic";

export default async function CustomerPortalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { supabase, user } = await requireCustomer("/account");
  const { data: profile } = await supabase.from("customer_profiles").select("display_name").eq("user_id", user.id).maybeSingle();
  const summary = customerSummary(user);
  return <CustomerPortalShell user={{ email: summary.email, avatarUrl: summary.avatarUrl }} displayName={profile?.display_name || summary.displayName}>{children}</CustomerPortalShell>;
}
