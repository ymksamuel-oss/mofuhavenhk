import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "mofu_admin_session";
const password = () => process.env.ADMIN_PASSWORD || "admin1234";
const secret = () => process.env.ADMIN_SESSION_SECRET || "mofu-admin-session-change-me";

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export function verifyAdminPassword(value: string) {
  return value === password();
}

export function createAdminToken() {
  const payload = `${Date.now()}.${Math.random().toString(36).slice(2)}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminToken(token: string | undefined) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length < 3) return false;
  const payload = parts.slice(0, 2).join(".");
  const signature = parts.slice(2).join(".");
  const expected = sign(payload);
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected)) && Date.now() - Number(parts[0]) < 1000 * 60 * 60 * 24 * 7;
  } catch {
    return false;
  }
}
