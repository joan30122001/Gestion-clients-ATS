import { describe, expect, it, vi } from "vitest";
import { getAdminProfile } from "./get-admin-profile";

function clientReturning(result: unknown) {
  const maybeSingle = vi.fn().mockResolvedValue(result);
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));
  return { client: { from }, from, select, eq };
}

describe("getAdminProfile", () => {
  it.each([
    ["ADMIN actif", { role: "ADMIN", is_active: true }, true],
    ["ADMIN inactif", { role: "ADMIN", is_active: false }, false],
    ["AGENT actif", { role: "AGENT", is_active: true }, false],
    ["COMPTABLE actif", { role: "COMPTABLE", is_active: true }, false],
    ["profil absent", null, false],
  ])("contrôle %s", async (_label, data, authorized) => {
    const { client, from, select, eq } = clientReturning({ data, error: null });
    await expect(getAdminProfile(client as never, "user-42")).resolves.toEqual({ authorized, failed: false });
    expect(from).toHaveBeenCalledWith("profiles");
    expect(select).toHaveBeenCalledWith("role,is_active");
    expect(eq).toHaveBeenCalledWith("id", "user-42");
  });

  it("distingue une lecture en erreur sans en exposer le détail", async () => {
    const { client } = clientReturning({ data: null, error: { message: "database-secret" } });
    await expect(getAdminProfile(client as never, "user-42")).resolves.toEqual({ authorized: false, failed: true });
  });
});

