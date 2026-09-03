import { beforeEach, describe, expect, it, vi } from "vitest";
import { initialPackageState } from "./package-state";

const mocks = vi.hoisted(() => ({ requireActiveAdmin: vi.fn(), create: vi.fn(), update: vi.fn(), revalidatePath: vi.fn(), redirect: vi.fn(() => { throw new Error("NEXT_REDIRECT"); }) }));
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/features/auth/application/require-active-admin", () => ({
  AdminAccessDeniedError: class AdminAccessDeniedError extends Error {},
  requireActiveAdmin: mocks.requireActiveAdmin,
}));
vi.mock("@/features/packages/infrastructure/packages-repository", () => ({
  PackagesRepository: class { create = mocks.create; update = mocks.update; },
}));

import { createPackageAction, updatePackageAction } from "./package-actions";

function data(extra: Record<string, string> = {}) {
  const formData = new FormData();
  Object.entries({ name: "Essentiel", description: "Offre", monthlyPrice: "15000", isActive: "true", ...extra }).forEach(([key, value]) => formData.set(key, value));
  return formData;
}

describe("package actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireActiveAdmin.mockResolvedValue({ client: {} });
  });

  it("persiste une création valide et invalide uniquement /forfaits", async () => {
    mocks.create.mockResolvedValue({ id: "p1" });
    const result = await createPackageAction(initialPackageState, data());
    expect(result.ok).toBe(true);
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ monthlyPrice: "15000", isActive: true }));
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/forfaits");
  });

  it("persiste une modification, y compris la désactivation", async () => {
    mocks.update.mockResolvedValue({ id: "11111111-1111-4111-8111-111111111111" });
    const result = await updatePackageAction(initialPackageState, data({ id: "11111111-1111-4111-8111-111111111111", isActive: "false" }));
    expect(result.ok).toBe(true);
    expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({ isActive: false }));
  });

  it("n’écrit rien lorsque la saisie est invalide", async () => {
    const result = await createPackageAction(initialPackageState, data({ monthlyPrice: "1.5" }));
    expect(result).toMatchObject({ ok: false, code: "VALIDATION_ERROR" });
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.requireActiveAdmin).toHaveBeenCalled();
  });

  it("redirige avant validation si l’accès est refusé et ne capture pas NEXT_REDIRECT", async () => {
    const { AdminAccessDeniedError } = await import("@/features/auth/application/require-active-admin");
    mocks.requireActiveAdmin.mockRejectedValue(new AdminAccessDeniedError());
    await expect(createPackageAction(initialPackageState, data({ name: "", monthlyPrice: "abc" }))).rejects.toThrow("NEXT_REDIRECT");
    expect(mocks.redirect).toHaveBeenCalledWith("/login");
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("rejette un statut absent ou falsifié sans écrire", async () => {
    await expect(createPackageAction(initialPackageState, data({ isActive: "forged" }))).resolves.toMatchObject({ ok: false, code: "VALIDATION_ERROR" });
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("revalide la modification et signale un forfait introuvable", async () => {
    mocks.update.mockResolvedValueOnce(null);
    await expect(updatePackageAction(initialPackageState, data({ id: "11111111-1111-4111-8111-111111111111" }))).resolves.toMatchObject({ ok: false, code: "NOT_FOUND" });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
    mocks.update.mockResolvedValueOnce({ id: "p" });
    await updatePackageAction(initialPackageState, data({ id: "11111111-1111-4111-8111-111111111111" }));
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/forfaits");
  });

  it("ne divulgue pas une panne du dépôt", async () => {
    mocks.create.mockRejectedValue(new Error("relation packages secret"));
    const result = await createPackageAction(initialPackageState, data());
    expect(result).toMatchObject({ ok: false, code: "TECHNICAL_ERROR", message: "L’opération n’a pas pu aboutir. Veuillez réessayer." });
    expect(JSON.stringify(result)).not.toContain("relation packages secret");
  });
});
