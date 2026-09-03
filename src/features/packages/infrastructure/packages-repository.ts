import "server-only";

import type { PackageRecord } from "@/features/packages/application/package-state";
import { readLocalJson, updateLocalJson } from "@/lib/local-store/local-store";

export class PackagesRepositoryError extends Error {}
const file = "packages.json";

export class PackagesRepository {
  constructor(legacyClient?: unknown) { void legacyClient; }
  async list(): Promise<PackageRecord[]> { return readLocalJson(file, []); }
  async listActive(): Promise<PackageRecord[]> { return (await this.list()).filter((item) => item.isActive); }
  async findActive(id: string): Promise<PackageRecord | null> { return (await this.listActive()).find((item) => item.id === id) ?? null; }
  async create(input: { name: string; description: string; monthlyPrice: string; isActive: boolean }): Promise<PackageRecord> {
    const now = new Date().toISOString();
    const record = { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    await updateLocalJson<PackageRecord[]>(file, [], (items) => [...items, record]);
    return record;
  }
  async update(input: { id: string; name: string; description: string; monthlyPrice: string; isActive: boolean }): Promise<PackageRecord | null> {
    let updated: PackageRecord | null = null;
    await updateLocalJson<PackageRecord[]>(file, [], (items) => items.map((item) => {
      if (item.id !== input.id) return item;
      updated = { ...item, ...input, updatedAt: new Date().toISOString() };
      return updated;
    }));
    return updated;
  }
}
