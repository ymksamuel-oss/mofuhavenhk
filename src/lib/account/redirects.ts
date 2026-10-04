export function safeReturnPath(value: unknown, fallback = "/account"): string {
  if (typeof value !== "string") return fallback;
  const candidate = value.trim();
  if (!candidate.startsWith("/") || candidate.startsWith("//") || candidate.includes("\\") || /[\u0000-\u001f]/.test(candidate)) return fallback;
  try {
    const parsed = new URL(candidate, "https://internal.invalid");
    if (parsed.origin !== "https://internal.invalid") return fallback;
    if (parsed.pathname.startsWith("/account/login") || parsed.pathname.startsWith("/account/signup")) return "/account";
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

export function trustedSiteOrigin(headers: Headers): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL?.trim(),
    headers.get("origin")?.trim(),
    (() => {
      const host = headers.get("x-forwarded-host")?.split(",")[0]?.trim();
      const protocol = headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
      return host ? `${protocol}://${host}` : "";
    })(),
    "https://www.mofuhavenhk.com",
  ];
  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      const parsed = new URL(candidate);
      const host = parsed.hostname.toLowerCase();
      const allowedHost = host === "mofuhavenhk.com" || host.endsWith(".mofuhavenhk.com") || host.endsWith(".vercel.app") || host === "localhost";
      if (!allowedHost) continue;
      if (parsed.protocol === "https:" || (parsed.protocol === "http:" && host === "localhost")) return parsed.origin;
    } catch {
      // Ignore invalid forwarded/configured origins.
    }
  }
  return "https://www.mofuhavenhk.com";
}
