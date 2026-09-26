import { NextRequest, NextResponse } from "next/server";

const CANONICAL_HOST = "www.mofuhavenhk.com";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0].toLowerCase();
  const legacyPath = request.nextUrl.pathname.replace(/\/+$/, "").toLowerCase();
  if ([
    "/collections/supplies",
    "/collections/gear",
    "/collections/outdoor-gear",
    "/categories/supplies",
    "/categories/pet-supplies",
    "/categories/lifestyle",
    "/categories/outdoor",
  ].includes(legacyPath)) {
    const url = request.nextUrl.clone();
    url.pathname = "/products";
    return NextResponse.redirect(url, 301);
  }
  if (host === "mofuhavenhk.com") {
    const url = request.nextUrl.clone();
    url.hostname = CANONICAL_HOST;
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }
  const response = NextResponse.next();
  const nextLocale = request.cookies.get("NEXT_LOCALE")?.value;
  const legacyLocale = request.cookies.get("mofuhavenhk-locale")?.value;
  if (nextLocale !== "zh-HK" && nextLocale !== "en") {
    response.cookies.set("NEXT_LOCALE", legacyLocale === "en" ? "en" : "zh-HK", {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
