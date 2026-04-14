import { createHmac, timingSafeEqual } from "crypto";

export const CONTEST_ADMIN_COOKIE = "contest_admin";

function adminSecret(): string | null {
  const s = process.env.CONTEST_ADMIN_SECRET;
  return s && s.length >= 16 ? s : null;
}

export function isAdminAuthConfigured(): boolean {
  return !!(adminSecret() && process.env.CONTEST_ADMIN_PASSWORD);
}

export function signAdminSession(expiresAtUnixSec: number): string | null {
  const secret = adminSecret();
  if (!secret) return null;
  const payload = String(expiresAtUnixSec);
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyAdminToken(token: string | undefined | null): boolean {
  if (!token?.includes(".")) return false;
  const secret = adminSecret();
  if (!secret) return false;
  const dot = token.lastIndexOf(".");
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!/^\d+$/.test(payload) || !sig) return false;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  if (expected.length !== sig.length) return false;
  try {
    if (!timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return false;
  } catch {
    return false;
  }
  const exp = Number.parseInt(payload, 10);
  return exp > Math.floor(Date.now() / 1000);
}
