import { NextResponse } from "next/server";
import {
  getRuntimeStripeSetting,
  isRuntimeStripeConfigured,
} from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/stripe/config
 * Returns the publishable key for Stripe.js (never the secret key).
 */
export async function GET() {
  const publishableKey = await getRuntimeStripeSetting("stripe_publishable_key");
  return NextResponse.json({
    ok: true,
    configured: await isRuntimeStripeConfigured(),
    publishableKey: publishableKey || null,
  });
}
