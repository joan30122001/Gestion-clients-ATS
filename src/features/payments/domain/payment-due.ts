import { getNextDueDate, getPaymentProgress } from "@/features/payments/domain/payment-status";

export type DueStatus = "upcoming" | "overdue" | "complete";

export function getDueStatus(nextDueDate: string, durationMonths: string, completedMonths: bigint, today = new Date()): DueStatus {
  if (completedMonths >= BigInt(durationMonths)) return "complete";
  const due = new Date(`${nextDueDate}T00:00:00Z`);
  const current = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  return due < current ? "overdue" : "upcoming";
}

export function getClientDueStatus(client: { subscriptionDate: string; durationMonths: string; monthlyAmount: string }, paidAmount: bigint, today = new Date()) {
  const progress = getPaymentProgress(client.durationMonths, client.monthlyAmount, paidAmount);
  const nextDueDate = getNextDueDate(client.subscriptionDate, progress.completedMonths);
  return { ...progress, nextDueDate, dueStatus: getDueStatus(nextDueDate, client.durationMonths, progress.completedMonths, today) };
}
