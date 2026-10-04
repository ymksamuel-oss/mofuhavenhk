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
        <SubmitButton pendingLabel="正在連接 Google…">
          {mode === "login" ? "使用 Google 登入" : "使用 Google 建立帳戶"}
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
  const [state, action] = useActionState(signInAction, EMPTY_ACCOUNT_ACTION_STATE);
  return (
    <div className="space-y-4">
      <form action={action} className="space-y-4">
        <input type="hidden" name="returnTo" value={returnTo} />
        <label className="block space-y-1.5"><span className="text-sm font-medium">Email</span><input className={inputClass} type="email" name="email" required maxLength={254} autoComplete="email" inputMode="email" placeholder="you@example.com" /></label>
        <label className="block space-y-1.5"><span className="text-sm font-medium">{returnTo === "/checkout" ? "密碼 / Password" : "密碼"}</span><input className={inputClass} type="password" name="password" required autoComplete="current-password" /></label>
        <div className="flex justify-end"><Link href="/account/forgot-password" className="text-sm font-medium text-[color:var(--accent)] underline-offset-4 hover:underline">忘記密碼？</Link></div>
        <Message ok={state.ok}>{state.message}</Message>
        <SubmitButton pendingLabel="登入中…">登入</SubmitButton>
      </form>
      {GOOGLE_OAUTH_ENABLED ? (
        <>
          <div className="flex items-center gap-3 text-xs text-[color:var(--muted)]"><span className="h-px flex-1 bg-[color:var(--line)]" />或使用<span className="h-px flex-1 bg-[color:var(--line)]" /></div>
          <GoogleSignInForm returnTo={returnTo} mode="login" />
        </>
      ) : null}
      <p className="text-center text-sm text-[color:var(--muted)]">還未成為會員？ <Link href={`/account/signup?returnTo=${encodeURIComponent(returnTo)}`} className="font-semibold text-[color:var(--accent)] underline-offset-4 hover:underline">立即註冊</Link></p>
    </div>
  );
}

export function SignupForm({ email = "", displayName = "", returnTo = "/account" }: { email?: string; displayName?: string; returnTo?: string }) {
  const [state, action] = useActionState(signUpAction, EMPTY_ACCOUNT_ACTION_STATE);
  return (
    <div className="space-y-4">
      <form action={action} className="space-y-4">
        <input type="hidden" name="returnTo" value={returnTo} />
        <label className="block space-y-1.5"><span className="text-sm font-medium">稱呼 / Name</span><input className={inputClass} name="displayName" required maxLength={100} autoComplete="name" defaultValue={displayName} /></label>
        <label className="block space-y-1.5"><span className="text-sm font-medium">Email</span><input className={inputClass} type="email" name="email" required maxLength={254} autoComplete="email" inputMode="email" defaultValue={email} /></label>
        <label className="block space-y-1.5"><span className="text-sm font-medium">密碼 / Password</span><input className={inputClass} type="password" name="password" required minLength={12} maxLength={128} autoComplete="new-password" aria-describedby="signup-password-hint" /><span id="signup-password-hint" className="block text-xs leading-5 text-[color:var(--muted)]">至少 12 個字元；請使用不易猜測的密碼。</span></label>
        <Message ok={state.ok}>{state.message}</Message>
        <SubmitButton pendingLabel="正在建立帳戶…">建立會員帳戶</SubmitButton>
      </form>
      {GOOGLE_OAUTH_ENABLED ? (
        <>
          <div className="flex items-center gap-3 text-xs text-[color:var(--muted)]"><span className="h-px flex-1 bg-[color:var(--line)]" />或使用<span className="h-px flex-1 bg-[color:var(--line)]" /></div>
          <GoogleSignInForm returnTo={returnTo} mode="signup" />
        </>
      ) : null}
      <p className="text-center text-sm text-[color:var(--muted)]">已有帳戶？ <Link href={`/account/login?returnTo=${encodeURIComponent(returnTo)}`} className="font-semibold text-[color:var(--accent)] underline-offset-4 hover:underline">登入</Link></p>
    </div>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(forgotPasswordAction, EMPTY_ACCOUNT_ACTION_STATE);
  return <form action={action} className="space-y-4">
    <label className="block space-y-1.5"><span className="text-sm font-medium">註冊 Email</span><input className={inputClass} type="email" name="email" required maxLength={254} autoComplete="email" inputMode="email" /></label>
    <Message ok={state.ok}>{state.message}</Message>
    <SubmitButton pendingLabel="正在寄送…">寄出重設連結</SubmitButton>
  </form>;
}

export function ResetPasswordForm() {
  const [state, action] = useActionState(resetPasswordAction, EMPTY_ACCOUNT_ACTION_STATE);
  return <form action={action} className="space-y-4">
    <label className="block space-y-1.5"><span className="text-sm font-medium">新密碼</span><input className={inputClass} type="password" name="password" required minLength={12} maxLength={128} autoComplete="new-password" /></label>
    <label className="block space-y-1.5"><span className="text-sm font-medium">確認新密碼</span><input className={inputClass} type="password" name="confirmPassword" required minLength={12} maxLength={128} autoComplete="new-password" /></label>
    <Message ok={state.ok}>{state.message}</Message>
    <SubmitButton pendingLabel="正在更新…">更新密碼</SubmitButton>
  </form>;
}
