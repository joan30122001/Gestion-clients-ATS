import { redirect } from "next/navigation";
import { AdminAccessDeniedError } from "@/features/auth/application/require-active-admin";
import { ClientsRepository } from "@/features/clients/infrastructure/clients-repository";
import { ClientsList } from "@/features/clients/ui/clients-list";
import { listPackages } from "@/features/packages/application/list-packages";
import { PaymentsRepository } from "@/features/payments/infrastructure/payments-repository";
import { getPaymentTotals } from "@/features/payments/domain/payment-status";
import { getClientDueStatus } from "@/features/payments/domain/payment-due";

export const dynamic = "force-dynamic";

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  try {
    const [clients, packages] = await Promise.all([new ClientsRepository().list(), listPackages()]);
    const paymentsRepository = new PaymentsRepository();
    const clientsWithFinance = await Promise.all(clients.map(async (client) => { const clientPayments = await paymentsRepository.listByClient(client.id); const totals = getPaymentTotals(client.totalAmount, clientPayments); const due = getClientDueStatus(client, totals.paidAmount); return { ...client, paidAmount: totals.paidAmount.toString(), remainingAmount: totals.remainingAmount.toString(), status: totals.status, dueStatus: due.dueStatus, nextDueDate: due.nextDueDate }; }));
    const requestedStatus = (await searchParams).status;
    const initialStatus = requestedStatus === "paid" || requestedStatus === "partial" || requestedStatus === "unpaid" ? requestedStatus : "all";
    return <main className="min-h-dvh bg-slate-100"><div className="mx-auto max-w-7xl space-y-6 px-5 py-6 sm:px-8 lg:px-10"><header className="border-b border-slate-200 pb-5"><h1 className="text-3xl font-bold tracking-tight text-slate-950">Clients</h1><p className="mt-1.5 text-sm text-slate-500">Gérez vos clients et leurs abonnements.</p></header><section aria-labelledby="clients-title"><div className="mb-3 flex items-center justify-between"><h2 id="clients-title" className="text-lg font-bold text-slate-950">Liste des clients</h2><p className="text-sm text-slate-500">{clientsWithFinance.length} résultat{clientsWithFinance.length > 1 ? "s" : ""}</p></div><ClientsList clients={clientsWithFinance} packages={packages} initialStatus={initialStatus} /></section></div></main>;
  } catch (error) {
    if (error instanceof AdminAccessDeniedError) redirect("/login");
    return <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10"><p role="alert">Les clients sont momentanément indisponibles.</p></main>;
  }
}
