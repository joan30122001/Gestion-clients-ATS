import { beforeEach, describe, expect, it, vi } from "vitest";

let store = { nextSequence: 1, clients: [] as unknown[] };
let queue = Promise.resolve();
vi.mock("server-only", () => ({}));
vi.mock("@/lib/local-store/local-store", () => ({
  readLocalJson: vi.fn(async () => store),
  updateLocalJson: vi.fn((_file, _fallback, update) => {
    const operation = queue.then(async () => { store = await update(store); return store; });
    queue = operation.then(() => undefined); return operation;
  }),
}));

describe("ClientsRepository", () => {
  beforeEach(() => { store = { nextSequence: 1, clients: [] }; queue = Promise.resolve(); });
  it("attribue des codes séquentiels uniques sous créations concurrentes", async () => {
    const { ClientsRepository } = await import("./clients-repository");
    const repository = new ClientsRepository();
    const base = { name: "Awa", phone: "+237699000000", location: "Douala", subscriptionDate: "2026-09-03", packageId: "p1", packageName: "Essentiel", packageDescription: "Offre", packageMonthlyPrice: "10000", durationMonths: "3", monthlyAmount: "10000", totalAmount: "30000", customTotal: false, notes: "" };
    const clients = await Promise.all([repository.create(base), repository.create({ ...base, name: "Paul" }), repository.create({ ...base, name: "Mina" })]);
    expect(clients.map((client) => client.code)).toEqual(["CLI-000001", "CLI-000002", "CLI-000003"]);
  });
});
