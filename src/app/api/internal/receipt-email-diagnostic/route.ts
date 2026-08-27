import { createHash, timingSafeEqual } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { readServerEnv } from "@/lib/serverEnv";

export const runtime = "nodejs";

const TEST_TOKEN_HASH = "8a1ef391b85aa98a020baceed944b50fc9f04a9a0473479efc3d1a0014329a84";
const TEST_EXPIRES_AT = Date.parse("2026-08-27T10:00:04Z");
const RESEND_DOMAINS_URL = "https://api.resend.com/domains";

type ResendDomain = {
  name?: unknown;
  status?: unknown;
  capabilities?: { sending?: unknown };
};

type ResendDomainsResponse = { data?: unknown };

function hasValidTestToken(value: string | null): boolean {
  if (!value) return false;
  const received = Buffer.from(createHash("sha256").update(value).digest("hex"), "utf8");
  const expected = Buffer.from(TEST_TOKEN_HASH, "utf8");
  return received.length === expected.length && timingSafeEqual(received, expected);
}

function unavailable(): NextResponse {
  return new NextResponse(null, { status: 404 });
}

function senderDomain(value: string): string | null {
  const address = (value.match(/<\s*([^>]+)\s*>/)?.[1] || value).trim().toLowerCase();
  const at = address.lastIndexOf("@");
  return at > 0 && at < address.length - 1 ? address.slice(at + 1) : null;
}

export async function POST(request: NextRequest) {
  if (Date.now() > TEST_EXPIRES_AT || !hasValidTestToken(request.headers.get("x-mofu-receipt-test-token"))) {
    return unavailable();
  }

  const apiKey = readServerEnv("RESEND_API_KEY");
  const from = readServerEnv("RECEIPT_FROM_EMAIL");
  const domain = from ? senderDomain(from) : null;

  if (!apiKey || !from || !domain) {
    return NextResponse.json({ ok: false, code: "not_configured", hasApiKey: Boolean(apiKey), hasSender: Boolean(from) });
  }

  try {
    const response = await fetch(RESEND_DOMAINS_URL, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });
    if (!response.ok) {
      return NextResponse.json({ ok: false, code: "resend_api_rejected", httpStatus: response.status, senderDomain: domain });
    }

    const body = (await response.json().catch(() => ({}))) as ResendDomainsResponse;
    const domains = Array.isArray(body.data) ? (body.data as ResendDomain[]) : [];
    const match = domains.find((entry) => typeof entry.name === "string" && entry.name.toLowerCase() === domain);
    const status = typeof match?.status === "string" ? match.status : "not_found";
    const sending = typeof match?.capabilities?.sending === "string" ? match.capabilities.sending : "unknown";

    return NextResponse.json({
      ok: status === "verified" && sending === "enabled",
      code: status === "verified" && sending === "enabled" ? "sender_ready" : "sender_domain_not_ready",
      senderDomain: domain,
      senderDomainStatus: status,
      sendingCapability: sending,
    });
  } catch {
    return NextResponse.json({ ok: false, code: "resend_domains_request_failed", senderDomain: domain });
  }
}

export async function GET() {
  return unavailable();
}
