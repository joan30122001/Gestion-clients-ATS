import "server-only";

import { readLocalJson, updateLocalJson } from "@/lib/local-store/local-store";

export type PaymentRecord = {
  id: string;
  clientId: string;
  amount: string;
  date: string;
  method: string;
  reference: string;
  note: string;
  author: string;
  createdAt: string;
};

export class PaymentsRepository {
  async listByClient(clientId: string): Promise<PaymentRecord[]> {
    const payments = await readLocalJson<PaymentRecord[]>("payments.json", []);
    return payments.filter((payment) => payment.clientId === clientId).sort((first, second) => second.date.localeCompare(first.date));
  }

  async list(): Promise<PaymentRecord[]> {
    return (await readLocalJson<PaymentRecord[]>("payments.json", [])).sort((first, second) => second.date.localeCompare(first.date) || second.createdAt.localeCompare(first.createdAt));
  }

  async totalByClient(clientId: string): Promise<bigint> {
    const payments = await this.listByClient(clientId);
    return payments.reduce((total, payment) => total + BigInt(payment.amount), 0n);
  }

  async create(input: Omit<PaymentRecord, "id" | "createdAt">): Promise<PaymentRecord> {
    const payment = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    await updateLocalJson<PaymentRecord[]>("payments.json", [], (payments) => [...payments, payment]);
    return payment;
  }
}
