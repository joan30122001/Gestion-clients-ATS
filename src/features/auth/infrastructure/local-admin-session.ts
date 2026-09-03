import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "ats_admin_session";
const lifetimeSeconds = 60 * 60 * 12;

function secret(): string {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 16) throw new Error("AUTH_SECRET absent ou trop court.");
  return value;
}

function signature(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export async function createLocalAdminSession(): Promise<void> {
  const payload = `ADMIN.${Date.now()}`;
  (await cookies()).set(ADMIN_SESSION_COOKIE, `${payload}.${signature(payload)}`, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: lifetimeSeconds,
  });
}

export async function clearLocalAdminSession(): Promise<void> {
  (await cookies()).delete(ADMIN_SESSION_COOKIE);
}

export async function hasValidLocalAdminSession(): Promise<boolean> {
  const value = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!value) return false;
  const parts = value.split(".");
  if (parts.length !== 3 || parts[0] !== "ADMIN") return false;
  const payload = `${parts[0]}.${parts[1]}`;
  const expected = Buffer.from(signature(payload));
  const received = Buffer.from(parts[2]);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return false;
  const issuedAt = Number(parts[1]);
  return Number.isFinite(issuedAt) && issuedAt <= Date.now() && Date.now() - issuedAt <= lifetimeSeconds * 1000;
}
