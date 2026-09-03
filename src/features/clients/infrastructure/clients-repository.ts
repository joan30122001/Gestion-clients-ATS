import "server-only";

import { readLocalJson, updateLocalJson } from "@/lib/local-store/local-store";

export type ClientRecord = {
  id: string; code: string; name: string; phone: string; location: string; subscriptionDate: string;
  packageId: string; packageName: string; packageDescription: string; packageMonthlyPrice: string;
  durationMonths: string; monthlyAmount: string; totalAmount: string; customTotal: boolean; notes: string; createdAt: string; deletedAt?: string;
};
type Store = { nextSequence: number; clients: ClientRecord[] };
const empty: Store = { nextSequence: 1, clients: [] };

export class ClientsRepository {
  async create(input: Omit<ClientRecord, "id" | "code" | "createdAt">): Promise<ClientRecord> {
    let created!: ClientRecord;
    await updateLocalJson<Store>("clients.json", empty, (store) => {
      const sequence = store.nextSequence;
      if (!Number.isSafeInteger(sequence) || sequence < 1 || sequence > 999999) throw new Error("Compteur client épuisé.");
      created = { ...input, id: crypto.randomUUID(), code: `CLI-${String(sequence).padStart(6, "0")}`, createdAt: new Date().toISOString() };
      return { nextSequence: sequence + 1, clients: [...store.clients, created] };
    });
    return created;
  }
  async list(): Promise<ClientRecord[]> { return (await readLocalJson<Store>("clients.json", empty)).clients.filter((client) => !client.deletedAt); }
  async findById(id: string): Promise<ClientRecord | null> { return (await this.list()).find((client) => client.id === id) ?? null; }
  async update(id: string, input: Omit<ClientRecord, "id" | "code" | "createdAt">): Promise<ClientRecord | null> {
    let updated: ClientRecord | null = null;
    await updateLocalJson<Store>("clients.json", empty, (store) => ({ ...store, clients: store.clients.map((client) => {
      if (client.id !== id) return client;
      updated = { ...client, ...input };
      return updated;
    }) }));
    return updated;
  }
  async remove(id: string): Promise<boolean> {
    let removed = false;
    await updateLocalJson<Store>("clients.json", empty, (store) => ({ ...store, clients: store.clients.map((client) => {
      if (client.id !== id || client.deletedAt) return client;
      removed = true;
      return { ...client, deletedAt: new Date().toISOString() };
    }) }));
    return removed;
  }
}
