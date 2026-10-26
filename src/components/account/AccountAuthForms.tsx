"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  forgotPasswordAction,
  resetPasswordAction,
  signInAction,
  signInWithGoogleAction,
  signUpAction,
} from "@/app/account/actions";
import { useI18n } from "@/lib/i18n/I18nProvider";

const EMPTY_ACCOUNT_ACTION_STATE = { ok: false } as const;
// Enable only after Google has been configured and tested in Supabase Auth Providers.
const GOOGLE_OAUTH_ENABLED = process.env.NEXT_PUBLIC_SUPABASE_GOOGLE_OAUTH_ENABLED === "true";

function SubmitButton({ children, pendingLabel }: { children: React.ReactNode; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="flex min-h-12 w-full items-center justify-center rounded-xl bg-[color:var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60">
      {pending ? pendingLabel : children}
    </button>
  );
}

function Message({ ok, children }: { ok: boolean; children?: string }) {
  if (!children) return null;
  return <p role={ok ? "status" : "alert"} className={`rounded-xl px-3.5 py-3 text-sm leading-5 ${ok ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-800"}`}>{children}</p>;
}

const inputClass = "min-h-12 w-full rounded-xl border border-[color:var(--line)] bg-white px-3.5 py-3 text-base text-[color:var(--ink)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)] sm:text-sm";

function GoogleSignInForm({ returnTo, mode }: { returnTo: string; mode: "login" | "signup" }) {
  const { locale, t } = useI18n();
  const [state, action] = useActionState(signInWithGoogleAction, EMPTY_ACCOUNT_ACTION_STATE);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!state.message) return;
    setToast(state.message);
    const timeout = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [state]);

  return (
    <>
      <form action={action}>
        <input type="hidden" name="returnTo" value={returnTo} />
        <input type="hidden" name="locale" value={locale} />
        <SubmitButton pendingLabel={t("accountGooglePending")}>
          {mode === "login" ? t("accountGoogleLogin") : t("accountGoogleSignup")}
        </SubmitButton>
      </form>
      {toast ? (
        <div className="fixed inset-x-4 bottom-6 z-[100] mx-auto max-w-md rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm font-medium text-stone-800 shadow-xl" role="alert" aria-live="assertive">
          {toast}
        </div>
      ) : null}
    </>
  );
}

export function LoginForm({ returnTo = "/account" }: { returnTo?: string }) {
  const { locale, t } = useI18n();
  const [state, action] = useActionState(signInAction, EMPTY_ACCOUNT_ACTION_STATE);
  return (
    <div className="space-y-4">
      <form action={action} className="space-y-4">
        <input type="hidden" name="returnTo" value={returnTo} />
        <input type="hidden" name="locale" value={locale} />
        <label className="block space-y-1.5"><span className="text-sm font-medium">{t("accountEmailLabel")}</span><input className={inputClass} type="email" name="email" required maxLength={254} autoComplete="email" inputMode="email" placeholder="you@example.com" /></label>
        <label className="block space-y-1.5"><span className="text-sm font-medium">{t("accountPasswordLabel")}</span><input className={inputClass} type="password" name="password" required autoComplete="current-password" /></label>
        <div className="flex justify-end"><Link href="/account/forgot-password" className="text-sm font-medium text-[color:var(--accent)] underline-offset-4 hover:underline">{t("accountForgotPassword")}</Link></div>
        <Message ok={state.ok}>{state.message}</Message>
        <SubmitButton pendingLabel={t("accountSignInPending")}>{t("accountSignIn")}</SubmitButton>
      </form>
      {GOOGLE_OAUTH_ENABLED ? (
        <>
          <div className="flex items-center gap-3 text-xs text-[color:var(--muted)]"><span className="h-px flex-1 bg-[color:var(--line)]" />{t("accountOr")}<span className="h-px flex-1 bg-[color:var(--line)]" /></div>
          <GoogleSignInForm returnTo={returnTo} mode="login" />
        </>
      ) : null}
      <p className="text-center text-sm text-[color:var(--muted)]">{t("accountNotMember")} <Link href={`/account/signup?returnTo=${encodeURIComponent(returnTo)}`} className="font-semibold text-[color:var(--accent)] underline-offset-4 hover:underline">{t("accountSignUp")}</Link></p>
    </div>
  );
}

export function SignupForm({ email = "", displayName = "", returnTo = "/account" }: { email?: string; displayName?: string; returnTo?: string }) {
  const { locale, t } = useI18n();
  const [state, action] = useActionState(signUpAction, EMPTY_ACCOUNT_ACTION_STATE);
  return (
    <div className="space-y-4">
      <form action={action} className="space-y-4">
        <input type="hidden" name="returnTo" value={returnTo} />
        <input type="hidden" name="locale" value={locale} />
        <label className="block space-y-1.5"><span className="text-sm font-medium">{t("accountDisplayNameLabel")}</span><input className={inputClass} name="displayName" required maxLength={100} autoComplete="name" defaultValue={displayName} /></label>
        <label className="block space-y-1.5"><span className="text-sm font-medium">{t("accountEmailLabel")}</span><input className={inputClass} type="email" name="email" required maxLength={254} autoComplete="email" inputMode="email" defaultValue={email} /></label>
        <label className="block space-y-1.5"><span className="text-sm font-medium">{t("accountPasswordLabel")}</span><input className={inputClass} type="password" name="password" required minLength={12} maxLength={128} autoComplete="new-password" aria-describedby="signup-password-hint" /><span id="signup-password-hint" className="block text-xs leading-5 text-[color:var(--muted)]">{t("accountPasswordHint")}</span></label>
        <Message ok={state.ok}>{state.message}</Message>
        <SubmitButton pendingLabel={t("accountCreateAccountPending")}>{t("accountCreateAccount")}</SubmitButton>
      </form>
      {GOOGLE_OAUTH_ENABLED ? (
        <>
          <div className="flex items-center gap-3 text-xs text-[color:var(--muted)]"><span className="h-px flex-1 bg-[color:var(--line)]" />{t("accountOr")}<span className="h-px flex-1 bg-[color:var(--line)]" /></div>
          <GoogleSignInForm returnTo={returnTo} mode="signup" />
        </>
      ) : null}
      <p className="text-center text-sm text-[color:var(--muted)]">{t("accountHasAccount")} <Link href={`/account/login?returnTo=${encodeURIComponent(returnTo)}`} className="font-semibold text-[color:var(--accent)] underline-offset-4 hover:underline">{t("accountSignIn")}</Link></p>
    </div>
  );
}

export function ForgotPasswordForm() {
  const { locale, t } = useI18n();
  const [state, action] = useActionState(forgotPasswordAction, EMPTY_ACCOUNT_ACTION_STATE);
  return <form action={action} className="space-y-4">
    <input type="hidden" name="locale" value={locale} />
    <label className="block space-y-1.5"><span className="text-sm font-medium">{t("accountForgotEmailLabel")}</span><input className={inputClass} type="email" name="email" required maxLength={254} autoComplete="email" inputMode="email" /></label>
    <Message ok={state.ok}>{state.message}</Message>
    <SubmitButton pendingLabel={t("accountSendResetPending")}>{t("accountSendReset")}</SubmitButton>
  </form>;
}

export function ResetPasswordForm() {
  const { locale, t } = useI18n();
  const [state, action] = useActionState(resetPasswordAction, EMPTY_ACCOUNT_ACTION_STATE);
  return <form action={action} className="space-y-4">
    <input type="hidden" name="locale" value={locale} />
    <label className="block space-y-1.5"><span className="text-sm font-medium">{t("accountNewPassword")}</span><input className={inputClass} type="password" name="password" required minLength={12} maxLength={128} autoComplete="new-password" /></label>
    <label className="block space-y-1.5"><span className="text-sm font-medium">{t("accountConfirmPassword")}</span><input className={inputClass} type="password" name="confirmPassword" required minLength={12} maxLength={128} autoComplete="new-password" /></label>
    <Message ok={state.ok}>{state.message}</Message>
    <SubmitButton pendingLabel={t("accountUpdatePasswordPending")}>{t("accountUpdatePassword")}</SubmitButton>
  </form>;
}
