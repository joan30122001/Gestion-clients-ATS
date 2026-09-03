import { beforeEach, describe, expect, it, vi } from "vitest";
import { initialClientState } from "./client-state";

const { requireAdmin, findActive, create, redirect } = vi.hoisted(() => ({ requireAdmin: vi.fn(), findActive: vi.fn(), create: vi.fn(), redirect: vi.fn(() => { throw new Error("NEXT_REDIRECT"); }) }));
vi.mock("@/features/auth/application/require-active-admin", () => ({ AdminAccessDeniedError: class extends Error {}, requireActiveAdmin: requireAdmin }));
vi.mock("@/features/packages/infrastructure/packages-repository", () => ({ PackagesRepository: class { findActive = findActive; } }));
vi.mock("@/features/clients/infrastructure/clients-repository", () => ({ ClientsRepository: class { create = create; } }));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

function form(overrides: Record<string, string> = {}) {
  const values = { name: "Awa", phone: "699000000", location: "Douala", subscriptionDate: "2026-09-03", packageId: "00000000-0000-4000-8000-000000000001", durationMonths: "3", monthlyAmount: "10000", totalAmount: "30000", notes: "" , ...overrides };
  const data = new FormData(); Object.entries(values).forEach(([key, value]) => data.set(key, value)); return data;
}

describe("createClientAction", () => {
  beforeEach(() => { vi.clearAllMocks(); requireAdmin.mockResolvedValue({ role: "ADMIN" }); findActive.mockResolvedValue({ id: "p1", name: "Essentiel", description: "Offre", monthlyPrice: "10000", isActive: true }); create.mockResolvedValue({ code: "CLI-000001" }); });
  it("crée un client standard avec instantané du forfait", async () => { const { createClientAction } = await import("./client-actions"); const result = await createClientAction(initialClientState, form()); expect(result).toMatchObject({ ok: true, data: { clientCode: "CLI-000001", customTotal: false } }); expect(create).toHaveBeenCalledWith(expect.objectContaining({ phone: "+237699000000", packageName: "Essentiel", totalAmount: "30000" })); });
  it("conserve et signale le total personnalisé", async () => { const { createClientAction } = await import("./client-actions"); const result = await createClientAction(initialClientState, form({ totalAmount: "25000" })); expect(result).toMatchObject({ ok: true, data: { customTotal: true } }); expect(create).toHaveBeenCalledWith(expect.objectContaining({ totalAmount: "25000", customTotal: true })); });
  it("ne crée rien lorsque les données sont invalides", async () => { const { createClientAction } = await import("./client-actions"); const result = await createClientAction(initialClientState, form({ phone: "123" })); expect(result).toMatchObject({ ok: false, code: "VALIDATION_ERROR" }); expect(create).not.toHaveBeenCalled(); });
  it("refuse un forfait absent ou devenu inactif", async () => { findActive.mockResolvedValue(null); const { createClientAction } = await import("./client-actions"); const result = await createClientAction(initialClientState, form()); expect(result).toMatchObject({ ok: false, code: "PACKAGE_UNAVAILABLE" }); expect(create).not.toHaveBeenCalled(); });
  it("redirige une session interdite sans créer", async () => { const { AdminAccessDeniedError } = await import("@/features/auth/application/require-active-admin"); requireAdmin.mockRejectedValue(new AdminAccessDeniedError()); const { createClientAction } = await import("./client-actions"); await expect(createClientAction(initialClientState, form())).rejects.toThrow("NEXT_REDIRECT"); expect(create).not.toHaveBeenCalled(); });
});
