import { afterEach, describe, expect, it, vi } from "vitest";
import { trustedSiteOrigin } from "@/lib/account/redirects";

afterEach(() => vi.unstubAllEnvs());

describe("trusted auth callback origin", () => {
  it("prefers the live request domain over a localhost site URL setting", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
    const requestHeaders = new Headers({
      origin: "https://www.mofuhavenhk.com",
      "x-forwarded-host": "www.mofuhavenhk.com",
      "x-forwarded-proto": "https",
    });

    expect(trustedSiteOrigin(requestHeaders)).toBe("https://www.mofuhavenhk.com");
  });

  it("never returns localhost, even when both forwarded and configured origins are local", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
    const requestHeaders = new Headers({
      origin: "http://localhost:3000",
      "x-forwarded-host": "localhost:3000",
      "x-forwarded-proto": "http",
    });

    const origin = trustedSiteOrigin(requestHeaders);
    expect(origin).toBe("https://www.mofuhavenhk.com");
    expect(origin).not.toContain("localhost");
  });

  it("uses an HTTPS forwarded deployment host when no Origin header is available", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
    const requestHeaders = new Headers({
      "x-forwarded-host": "preview-mofu.vercel.app",
      "x-forwarded-proto": "https",
    });

    expect(trustedSiteOrigin(requestHeaders)).toBe("https://preview-mofu.vercel.app");
  });
});
