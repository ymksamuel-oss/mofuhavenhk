import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseFetch } from "@/lib/supabase";

function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || "";
  return url && key ? { url, key } : null;
}

function isPublicAccountPath(pathname: string) {
  return [
    "/account/login",
    "/account/signup",
    "/account/forgot-password",
    "/account/reset-password",
  ].some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function copyCookies(from: NextResponse, to: NextResponse) {
  for (const cookie of from.cookies.getAll()) to.cookies.set(cookie.name, cookie.value, cookie);
  return to;
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const config = supabaseConfig();
  const isProtectedAccountRoute = request.nextUrl.pathname.startsWith("/account") && !isPublicAccountPath(request.nextUrl.pathname);

  if (!config) {
    if (!isProtectedAccountRoute) return response;
    const loginUrl = new URL("/account/login", request.url);
    loginUrl.searchParams.set("returnTo", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  const supabase = createServerClient(config.url, config.key, {
    global: { fetch: supabaseFetch },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
      },
    },
  });

  let hasVerifiedUser = false;
  try {
    const { data, error } = await supabase.auth.getClaims();
    hasVerifiedUser = !error && Boolean(data?.claims?.sub);
  } catch {
    // Fail closed for private portal routes; public storefront pages still render.
  }

  if (isProtectedAccountRoute && !hasVerifiedUser) {
    const loginUrl = new URL("/account/login", request.url);
    loginUrl.searchParams.set("returnTo", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return copyCookies(response, NextResponse.redirect(loginUrl));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
