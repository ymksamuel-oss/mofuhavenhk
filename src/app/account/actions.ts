"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeReturnPath, trustedSiteOrigin } from "@/lib/account/redirects";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "@/lib/account/validation";

export type AccountActionState = { ok: boolean; message?: string };

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function errorMessage(error: unknown) {
  if (error instanceof Error && error.message === "supabase_auth_not_configured") {
    return "會員登入服務尚未完成設定，請稍後再試。";
  }
  return "暫時無法完成操作，請稍後再試。";
}

export async function signInAction(_state: AccountActionState, formData: FormData): Promise<AccountActionState> {
  const parsed = loginSchema.safeParse({
    email: formString(formData, "email"),
    password: formString(formData, "password"),
    returnTo: formString(formData, "returnTo"),
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "請檢查輸入資料。" };
  let supabase;
  try {
    supabase = await createSupabaseServerClient();
  } catch (error) {
    return { ok: false, message: errorMessage(error) };
  }
  const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
  if (error) return { ok: false, message: "Email 或密碼不正確，或帳戶尚未完成驗證。" };
  redirect(safeReturnPath(parsed.data.returnTo, "/account"));
}

export async function signUpAction(_state: AccountActionState, formData: FormData): Promise<AccountActionState> {
  const parsed = signupSchema.safeParse({
    displayName: formString(formData, "displayName"),
    email: formString(formData, "email"),
    password: formString(formData, "password"),
    returnTo: formString(formData, "returnTo"),
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "請檢查輸入資料。" };
  let supabase;
  try {
    supabase = await createSupabaseServerClient();
  } catch (error) {
    return { ok: false, message: errorMessage(error) };
  }
  const origin = trustedSiteOrigin(await headers());
  const returnTo = safeReturnPath(parsed.data.returnTo, "/account");
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.displayName },
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(returnTo)}`,
    },
  });
  if (error) return { ok: false, message: "暫時無法建立帳戶，請檢查資料或稍後再試。" };
  if (data.session) redirect(returnTo);
  return { ok: true, message: "如果此 Email 可用，我們已寄出驗證連結。請完成驗證後登入；已驗證的同 Email 訪客訂單會自動歸戶。" };
}

export async function signInWithGoogleAction(_state: AccountActionState, formData: FormData): Promise<AccountActionState> {
  if (process.env.NEXT_PUBLIC_SUPABASE_GOOGLE_OAUTH_ENABLED !== "true") {
    return { ok: false, message: "Google 登入維護中，請使用 Email 快速登入。" };
  }
  const returnTo = safeReturnPath(formString(formData, "returnTo"), "/account");
  let redirectUrl: string | null = null;
  try {
    const supabase = await createSupabaseServerClient();
    const origin = trustedSiteOrigin(await headers());
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(returnTo)}` },
    });
    if (error) {
      const disabled = /unsupported provider|provider.{0,40}(not enabled|disabled)/i.test(error.message);
      return {
        ok: false,
        message: disabled
          ? "Google 登入維護中，請使用 Email 快速登入。"
          : "Google 登入暫時無法使用，請使用 Email 快速登入。",
      };
    }
    redirectUrl = data.url;
  } catch {
    return { ok: false, message: "Google 登入暫時無法使用，請使用 Email 快速登入。" };
  }
  if (!redirectUrl) return { ok: false, message: "Google 登入暫時無法使用，請使用 Email 快速登入。" };
  redirect(redirectUrl);
}

export async function forgotPasswordAction(_state: AccountActionState, formData: FormData): Promise<AccountActionState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formString(formData, "email") });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "請輸入有效 Email。" };
  try {
    const supabase = await createSupabaseServerClient();
    const origin = trustedSiteOrigin(await headers());
    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/account/reset-password")}`,
    });
  } catch {
    // Deliberately do not disclose whether the email belongs to an account.
  }
  return { ok: true, message: "如果此 Email 已註冊，我們已寄出密碼重設連結。" };
}

export async function resetPasswordAction(_state: AccountActionState, formData: FormData): Promise<AccountActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formString(formData, "password"),
    confirmPassword: formString(formData, "confirmPassword"),
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "請檢查新密碼。" };
  let supabase;
  try {
    supabase = await createSupabaseServerClient();
  } catch (error) {
    return { ok: false, message: errorMessage(error) };
  }
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { ok: false, message: "重設連結已失效，請重新申請。" };
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { ok: false, message: "密碼更新失敗，請重新申請重設連結。" };
  redirect("/account");
}

export async function signOutAction() {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } finally {
    redirect("/");
  }
}
