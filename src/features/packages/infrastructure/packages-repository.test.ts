import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { PackagesRepository, PackagesRepositoryError } from "./packages-repository";

const rows = [
  { id: "2", name: "Récent", description: "Actif", monthly_price: "9223372036854775807", is_active: true, created_at: "2026-02-02", updated_at: "2026-02-02" },
  { id: "1", name: "Historique", description: "Inactif", monthly_price: "100", is_active: false, created_at: "2026-01-01", updated_at: "2026-01-01" },
];

describe("PackagesRepository", () => {
  const rpc = vi.fn();
  const client = { rpc } as never;
  beforeEach(() => vi.clearAllMocks());

  it("liste dans l’ordre fourni par la RPC, conserve les inactifs et le bigint texte", async () => {
    rpc.mockResolvedValue({ data: rows, error: null });
    const result = await new PackagesRepository(client).list();
    expect(rpc).toHaveBeenCalledWith("list_packages_admin");
    expect(result.map((item) => [item.name, item.isActive, item.monthlyPrice])).toEqual([["Récent", true, "9223372036854775807"], ["Historique", false, "100"]]);
  });

  it("utilise une chaîne de réponse Supabase pour créer sans nombre JS", async () => {
    const single = vi.fn().mockResolvedValue({ data: rows[0], error: null });
    rpc.mockReturnValue({ single });
    await new PackagesRepository(client).create({ name: "Récent", description: "Actif", monthlyPrice: "9223372036854775807", isActive: true });
    expect(rpc).toHaveBeenCalledWith("create_package_admin", expect.objectContaining({ package_monthly_price: "9223372036854775807" }));
  });

  it("retourne null sur modification introuvable et encapsule les erreurs", async () => {
    rpc.mockReturnValueOnce({ maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) });
    await expect(new PackagesRepository(client).update({ id: "x", name: "N", description: "D", monthlyPrice: "1", isActive: false })).resolves.toBeNull();
    rpc.mockResolvedValueOnce({ data: null, error: { message: "secret" } });
    await expect(new PackagesRepository(client).list()).rejects.toBeInstanceOf(PackagesRepositoryError);
  });
});
