import { redirect } from "next/navigation";
import { AdminAccessDeniedError, requireActiveAdmin } from "@/features/auth/application/require-active-admin";
import { ClientsRepository } from "@/features/clients/infrastructure/clients-repository";
import { PaymentsRepository } from "@/features/payments/infrastructure/payments-repository";
import { PaymentsList } from "@/features/payments/ui/payments-list";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  try {
    const [payments, clients] = await Promise.all([new PaymentsRepository().list(), new ClientsRepository().list()]);
    const clientsById = new Map(clients.map((client) => [client.id, client]));
    const paymentsWithClient = payments.flatMap((payment) => { const client = clientsById.get(payment.clientId); return client ? [{ ...payment, clientName: client.name, clientCode: client.code }] : []; });
    return <main className="min-h-dvh bg-slate-100"><div className="mx-auto max-w-7xl space-y-6 px-5 py-6 sm:px-8 lg:px-10"><header className="border-b border-slate-200 pb-5"><h1 className="text-3xl font-bold tracking-tight text-slate-950">Paiements</h1><p className="mt-1.5 text-sm text-slate-500">Consultez l’ensemble des encaissements enregistrés.</p></header><section aria-labelledby="payments-list-title"><div className="mb-3 flex items-center justify-between"><h2 id="payments-list-title" className="text-lg font-bold text-slate-950">Liste des paiements</h2></div><PaymentsList payments={paymentsWithClient} /></section></div></main>;
  } catch (error) {
    if (error instanceof AdminAccessDeniedError) redirect("/login");
    return <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10"><p role="alert">Les paiements sont momentanément indisponibles.</p></main>;
  }
}
