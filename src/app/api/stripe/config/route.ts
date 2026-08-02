import { NextResponse } from "next/server";
import {
  getStripePublishableKey,
  isStripeConfigured,
} from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/stripe/config
 * Returns the publishable key for Stripe.js (never the secret key).
 */
export async function GET() {
  const publishableKey = getStripePublishableKey();
  return NextResponse.json({
    ok: true,
    configured: isStripeConfigured(),
    publishableKey: publishableKey || null,
  });
}
