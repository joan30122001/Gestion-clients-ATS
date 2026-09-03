export type PaymentStatus = "paid" | "partial" | "unpaid";

export function getPaymentStatus(totalAmount: string, paidAmount: bigint): PaymentStatus {
  const total = BigInt(totalAmount);
  if (paidAmount === 0n) return "unpaid";
  if (paidAmount >= total) return "paid";
  return "partial";
}

export function getRemainingAmount(totalAmount: string, paidAmount: bigint): bigint {
  const remaining = BigInt(totalAmount) - paidAmount;
  return remaining > 0n ? remaining : 0n;
}

export function getPaymentTotals(totalAmount: string, payments: { amount: string }[]) {
  const paidAmount = payments.reduce((total, payment) => total + BigInt(payment.amount), 0n);
  return { paidAmount, remainingAmount: getRemainingAmount(totalAmount, paidAmount), status: getPaymentStatus(totalAmount, paidAmount) };
}

export function getPaymentProgress(durationMonths: string, monthlyAmount: string, paidAmount: bigint) {
  const duration = BigInt(durationMonths);
  const monthly = BigInt(monthlyAmount);
  const paidMonths = monthly > 0n ? paidAmount / monthly : 0n;
  const completedMonths = paidMonths > duration ? duration : paidMonths;
  return { completedMonths, remainingMonths: duration - completedMonths, percentage: Number((completedMonths * 100n) / duration) };
}

export function getNextDueDate(subscriptionDate: string, completedMonths: bigint): string {
  const [year, month, day] = subscriptionDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + Number(completedMonths), day));
  if (date.getUTCDate() !== day) date.setUTCDate(0);
  return date.toISOString().slice(0, 10);
}
