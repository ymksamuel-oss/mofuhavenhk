import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
  signInWithOAuth: vi.fn(),
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  headers: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient,
}));
vi.mock("next/headers", () => ({ headers: mocks.headers }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import { signInWithGoogleAction } from "@/app/account/actions";

describe("Google OAuth fallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_GOOGLE_OAUTH_ENABLED", "true");
    mocks.headers.mockResolvedValue(new Headers({ "x-forwarded-host": "www.mofuhavenhk.com" }));
    mocks.createSupabaseServerClient.mockResolvedValue({
      auth: {
        signInWithOAuth: mocks.signInWithOAuth,
        signInWithPassword: mocks.signInWithPassword,
        signUp: mocks.signUp,
      },
    });
  });

  afterEach(() => vi.unstubAllEnvs());

  it("keeps Google OAuth disabled by default without calling Supabase", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_GOOGLE_OAUTH_ENABLED", "false");
    const result = await signInWithGoogleAction({ ok: false }, new FormData());

    expect(result).toEqual({
      ok: false,
      message: "Google 登入維護中，請使用 Email 快速登入。",
    });
    expect(mocks.createSupabaseServerClient).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("keeps the customer on the login page when Supabase has not enabled Google", async () => {
    mocks.signInWithOAuth.mockResolvedValue({
      data: { url: null },
      error: { message: "Unsupported provider: provider is not enabled" },
    });
    const formData = new FormData();
    formData.set("returnTo", "/account/orders");

    const result = await signInWithGoogleAction({ ok: false }, formData);

    expect(result).toEqual({
      ok: false,
      message: "Google 登入維護中，請使用 Email 快速登入。",
    });
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("returns a safe Email-login fallback for other OAuth errors", async () => {
    mocks.signInWithOAuth.mockResolvedValue({
      data: { url: null },
      error: { message: "OAuth temporarily unavailable" },
    });
    const result = await signInWithGoogleAction({ ok: false }, new FormData());

    expect(result).toEqual({
      ok: false,
      message: "Google 登入暫時無法使用，請使用 Email 快速登入。",
    });
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("keeps Email sign-in working and returns to the requested account page", async () => {
    const { signInAction } = await import("@/app/account/actions");
    mocks.signInWithPassword.mockResolvedValue({ error: null });
    const formData = new FormData();
    formData.set("email", "pet-parent@example.com");
    formData.set("password", "correct-horse-battery-staple-9");
    formData.set("returnTo", "/account/orders");

    await signInAction({ ok: false }, formData);

    expect(mocks.signInWithPassword).toHaveBeenCalledWith({
      email: "pet-parent@example.com",
      password: "correct-horse-battery-staple-9",
    });
    expect(mocks.redirect).toHaveBeenCalledWith("/account/orders");
  });

  it("keeps Email signup working and returns the verification confirmation", async () => {
    const { signUpAction } = await import("@/app/account/actions");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
    mocks.signUp.mockResolvedValue({ data: { session: null }, error: null });
    const formData = new FormData();
    formData.set("displayName", "毛孩家長");
    formData.set("email", "pet-parent@example.com");
    formData.set("password", "correct-horse-battery-staple-9");

    const result = await signUpAction({ ok: false }, formData);

    expect(result).toMatchObject({ ok: true });
    expect(mocks.signUp).toHaveBeenCalledWith(expect.objectContaining({
      email: "pet-parent@example.com",
      options: expect.objectContaining({
        data: { display_name: "毛孩家長" },
        emailRedirectTo: "https://www.mofuhavenhk.com/auth/callback?next=%2Faccount",
      }),
    }));
  });
});
