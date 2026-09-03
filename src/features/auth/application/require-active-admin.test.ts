import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClient, getAdminProfile } = vi.hoisted(() => ({ createClient: vi.fn(), getAdminProfile: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({ createClient }));
vi.mock("@/features/auth/infrastructure/get-admin-profile", () => ({ getAdminProfile }));

import { AdminAccessDeniedError, requireActiveAdmin } from "./require-active-admin";

describe("requireActiveAdmin", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retourne le client uniquement pour une session vérifiée et un ADMIN actif", async () => {
    const client = { auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } }, error: null }) } };
    createClient.mockResolvedValue(client);
    getAdminProfile.mockResolvedValue({ authorized: true, failed: false });
    await expect(requireActiveAdmin()).resolves.toMatchObject({ client, user: { id: "u1" } });
  });

  it.each([
    [{ data: { user: null }, error: null }, false],
    [{ data: { user: { id: "u1" } }, error: null }, false],
  ])("refuse visiteur, profil absent, inactif ou non ADMIN", async (authResult, authorized) => {
    const client = { auth: { getUser: vi.fn().mockResolvedValue(authResult) } };
    createClient.mockResolvedValue(client);
    getAdminProfile.mockResolvedValue({ authorized, failed: false });
    await expect(requireActiveAdmin()).rejects.toBeInstanceOf(AdminAccessDeniedError);
  });
});
