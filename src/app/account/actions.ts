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
import { translations, type Locale, type TranslationKey } from "@/lib/i18n/translations";

export type AccountActionState = { ok: boolean; message?: string };

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function actionLocale(formData: FormData): Locale {
  return formString(formData, "locale") === "en" ? "en" : "zh";
}

function accountMessage(locale: Locale, key: TranslationKey): string {
  return translations[locale][key];
}

function errorMessage(error: unknown, locale: Locale) {
  if (error instanceof Error && error.message === "supabase_auth_not_configured") {
    return accountMessage(locale, "accountServiceUnavailable");
  }
  return accountMessage(locale, "accountGenericError");
}

export async function signInAction(_state: AccountActionState, formData: FormData): Promise<AccountActionState> {
  const locale = actionLocale(formData);
  const parsed = loginSchema.safeParse({
    email: formString(formData, "email"),
    password: formString(formData, "password"),
    returnTo: formString(formData, "returnTo"),
  });
  if (!parsed.success) return { ok: false, message: accountMessage(locale, "accountValidationError") };
  let supabase;
  try {
    supabase = await createSupabaseServerClient();
  } catch (error) {
    return { ok: false, message: errorMessage(error, locale) };
  }
  const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
  if (error) return { ok: false, message: accountMessage(locale, "accountInvalidCredentials") };
  redirect(safeReturnPath(parsed.data.returnTo, "/account"));
}

export async function signUpAction(_state: AccountActionState, formData: FormData): Promise<AccountActionState> {
  const locale = actionLocale(formData);
  const parsed = signupSchema.safeParse({
    displayName: formString(formData, "displayName"),
    email: formString(formData, "email"),
    password: formString(formData, "password"),
    returnTo: formString(formData, "returnTo"),
  });
  if (!parsed.success) return { ok: false, message: accountMessage(locale, "accountValidationError") };
  let supabase;
  try {
    supabase = await createSupabaseServerClient();
  } catch (error) {
    return { ok: false, message: errorMessage(error, locale) };
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
  if (error) return { ok: false, message: accountMessage(locale, "accountSignupError") };
  if (data.session) redirect(returnTo);
  return { ok: true, message: accountMessage(locale, "accountSignupSuccess") };
}

export async function signInWithGoogleAction(_state: AccountActionState, formData: FormData): Promise<AccountActionState> {
  const locale = actionLocale(formData);
  if (process.env.NEXT_PUBLIC_SUPABASE_GOOGLE_OAUTH_ENABLED !== "true") {
    return { ok: false, message: accountMessage(locale, "accountGoogleDisabled") };
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
          ? accountMessage(locale, "accountGoogleDisabled")
          : accountMessage(locale, "accountGoogleError"),
      };
    }
    redirectUrl = data.url;
  } catch {
    return { ok: false, message: accountMessage(locale, "accountGoogleError") };
  }
  if (!redirectUrl) return { ok: false, message: accountMessage(locale, "accountGoogleError") };
  redirect(redirectUrl);
}

export async function forgotPasswordAction(_state: AccountActionState, formData: FormData): Promise<AccountActionState> {
  const locale = actionLocale(formData);
  const parsed = forgotPasswordSchema.safeParse({ email: formString(formData, "email") });
  if (!parsed.success) return { ok: false, message: accountMessage(locale, "accountValidationError") };
  try {
    const supabase = await createSupabaseServerClient();
    const origin = trustedSiteOrigin(await headers());
    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/account/reset-password")}`,
    });
  } catch {
    // Deliberately do not disclose whether the email belongs to an account.
  }
  return { ok: true, message: accountMessage(locale, "accountForgotSuccess") };
}

export async function resetPasswordAction(_state: AccountActionState, formData: FormData): Promise<AccountActionState> {
  const locale = actionLocale(formData);
  const parsed = resetPasswordSchema.safeParse({
    password: formString(formData, "password"),
    confirmPassword: formString(formData, "confirmPassword"),
  });
  if (!parsed.success) return { ok: false, message: accountMessage(locale, "accountValidationError") };
  let supabase;
  try {
    supabase = await createSupabaseServerClient();
  } catch (error) {
    return { ok: false, message: errorMessage(error, locale) };
  }
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { ok: false, message: accountMessage(locale, "accountResetExpired") };
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { ok: false, message: accountMessage(locale, "accountResetFailed") };
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
