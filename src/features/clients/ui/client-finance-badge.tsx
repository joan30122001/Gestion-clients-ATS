import type { PaymentStatus } from "@/features/payments/domain/payment-status";

const labels: Record<PaymentStatus, string> = { paid: "Soldé", partial: "En cours", unpaid: "Non payé" };
const styles: Record<PaymentStatus, string> = { paid: "bg-emerald-50 text-emerald-700", partial: "bg-amber-50 text-amber-700", unpaid: "bg-red-50 text-red-700" };

export function ClientFinanceBadge({ status }: { status: PaymentStatus }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>{labels[status]}</span>;
}
