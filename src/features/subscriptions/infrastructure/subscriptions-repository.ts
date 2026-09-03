import "server-only";

import { readLocalJson, updateLocalJson } from "@/lib/local-store/local-store";

export type SubscriptionRecord = {
  id: string;
  clientId: string;
  packageId: string;
  packageName: string;
  packageDescription: string;
  packageMonthlyPrice: string;
  subscriptionDate: string;
  durationMonths: string;
  monthlyAmount: string;
  totalAmount: string;
  customTotal: boolean;
  createdAt: string;
  endedAt?: string;
};

export class SubscriptionsRepository {
  async listByClient(clientId: string): Promise<SubscriptionRecord[]> {
    return (await readLocalJson<SubscriptionRecord[]>("subscriptions.json", [])).filter((subscription) => subscription.clientId === clientId).sort((first, second) => second.subscriptionDate.localeCompare(first.subscriptionDate));
  }

  async create(input: Omit<SubscriptionRecord, "id" | "createdAt">): Promise<SubscriptionRecord> {
    const subscription = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    await updateLocalJson<SubscriptionRecord[]>("subscriptions.json", [], (subscriptions) => [...subscriptions.map((item) => item.clientId === input.clientId && !item.endedAt ? { ...item, endedAt: input.subscriptionDate } : item), subscription]);
    return subscription;
  }
}
