import { AlertTriangle, CircleDollarSign, Package, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardActions } from "@/app/(admin)/dashboard/dashboard-actions";
import { ClientsRepository } from "@/features/clients/infrastructure/clients-repository";
import { PackagesRepository } from "@/features/packages/infrastructure/packages-repository";
import { formatFcfa } from "@/shared/format-fcfa";
import { PaymentsRepository } from "@/features/payments/infrastructure/payments-repository";
import { getClientDueStatus } from "@/features/payments/domain/payment-due";
import { getPaymentTotals } from "@/features/payments/domain/payment-status";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [clients, packages] = await Promise.all([
    new ClientsRepository().list(),
    new PackagesRepository().list(),
  ]);
  const paymentsRepository = new PaymentsRepository();
  const financialClients = await Promise.all(clients.map(async (client) => {
    const totals = getPaymentTotals(client.totalAmount, await paymentsRepository.listByClient(client.id));
    return { client, totals, due: getClientDueStatus(client, totals.paidAmount) };
  }));
  const overdueClients = financialClients.filter((item) => item.due.dueStatus === "overdue").length;
  const activeSubscriptions = clients.filter((client) => {
    const start = new Date(`${client.subscriptionDate}T00:00:00Z`);
    const end = new Date(start);
    end.setUTCMonth(end.getUTCMonth() + Number(client.durationMonths));
    return start <= new Date() && end > new Date();
  }).length;
  const collectedAmount = financialClients.reduce((total, item) => total + item.totals.paidAmount, 0n);
  const remainingAmount = financialClients.reduce((total, item) => total + item.totals.remainingAmount, 0n);
  const paidClients = financialClients.filter((item) => item.totals.status === "paid").length;
  const partialClients = financialClients.filter((item) => item.totals.status === "partial").length;
  const unpaidClients = financialClients.filter((item) => item.totals.status === "unpaid").length;
  const recentClients = [...clients].sort((first, second) => second.createdAt.localeCompare(first.createdAt)).slice(0, 5);
  const recentPayments = (await paymentsRepository.list()).filter((payment) => clients.some((client) => client.id === payment.clientId)).slice(0, 5);
  const clientsById = new Map(clients.map((client) => [client.id, client]));
  const priorityClients = financialClients.filter((item) => item.due.dueStatus === "overdue" || item.totals.status !== "paid").sort((first, second) => second.totals.remainingAmount > first.totals.remainingAmount ? 1 : -1).slice(0, 5);
  const activePackages = packages.filter((item) => item.isActive).length;
  const contractedAmount = clients.reduce((total, client) => total + BigInt(client.totalAmount), 0n);

  return (
    <main className="min-h-dvh bg-slate-100">
      <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
        <header className="border-b border-slate-200 pb-4">
          <div><h1 className="text-[28px] font-bold tracking-tight text-slate-950">Tableau de bord</h1><p className="mt-1 text-sm text-slate-500">Les indicateurs essentiels de votre activité.</p></div>
        </header>
        <section aria-labelledby="overview-title" className="pt-6"><div className="mb-4"><h2 id="overview-title" className="text-lg font-bold text-slate-950">Indicateurs clés</h2></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="rounded-xl border-slate-200 border-l-4 border-l-blue-600 shadow-sm"><CardContent className="p-5"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-500">Clients enregistrés</p><p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{clients.length}</p><p className="mt-1 text-xs text-slate-400">dossiers actifs dans le portefeuille</p></div><span className="rounded-lg bg-blue-50 p-2.5 text-blue-700"><Users size={19} aria-hidden="true" /></span></div></CardContent></Card>
          <Card className="rounded-xl border-slate-200 border-l-4 border-l-emerald-500 shadow-sm"><CardContent className="p-5"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-500">Abonnements actifs</p><p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{activeSubscriptions}</p><p className="mt-1 text-xs text-slate-400">sur {activePackages} forfaits disponibles</p></div><span className="rounded-lg bg-emerald-50 p-2.5 text-emerald-700"><Package size={19} aria-hidden="true" /></span></div></CardContent></Card>
          <Card className="rounded-xl border-slate-200 border-l-4 border-l-amber-500 shadow-sm sm:col-span-2 lg:col-span-1"><CardContent className="p-5"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-500">Montant contractuel</p><p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">{formatFcfa(contractedAmount)}</p><p className="mt-1 text-xs text-slate-400">total des abonnements enregistrés</p></div><span className="rounded-lg bg-amber-50 p-2.5 text-amber-700"><CircleDollarSign size={19} aria-hidden="true" /></span></div></CardContent></Card>
          <Card className="rounded-xl border-slate-200 border-l-4 border-l-red-500 shadow-sm sm:col-span-2 lg:col-span-1"><CardContent className="p-5"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-500">Échéances dépassées</p><p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{overdueClients}</p><p className="mt-1 text-xs text-slate-400">clients nécessitant une attention</p></div><span className="rounded-lg bg-red-50 p-2.5 text-red-700"><AlertTriangle size={19} aria-hidden="true" /></span></div></CardContent></Card>
          <Card className="rounded-xl border-slate-200 shadow-sm"><CardContent className="p-5"><p className="text-sm font-medium text-slate-500">Total encaissé</p><p className="mt-3 text-2xl font-bold tracking-tight text-emerald-700">{formatFcfa(collectedAmount)}</p><p className="mt-1 text-xs text-slate-400">paiements enregistrés</p></CardContent></Card>
          <Card className="rounded-xl border-slate-200 shadow-sm"><CardContent className="p-5"><p className="text-sm font-medium text-slate-500">Reste à encaisser</p><p className="mt-3 text-2xl font-bold tracking-tight text-red-700">{formatFcfa(remainingAmount)}</p><p className="mt-1 text-xs text-slate-400">sur les contrats actifs</p></CardContent></Card>
        </div></section>

        <section aria-labelledby="actions-title" className="mt-8 border-t border-slate-200 pt-6">
          <div className="mb-4"><h2 id="actions-title" className="text-lg font-bold text-slate-950">Actions rapides</h2></div>
          <DashboardActions packages={packages.filter((item) => item.isActive)} />
        </section>

        <section aria-labelledby="payment-status-title" className="mt-8 border-t border-slate-200 pt-6"><div className="mb-4"><h2 id="payment-status-title" className="text-lg font-bold text-slate-950">Situation des paiements</h2></div><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3"><p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Soldés</p><p className="mt-1 text-2xl font-bold text-emerald-900">{paidClients}</p></div><div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3"><p className="text-xs font-bold uppercase tracking-wide text-amber-700">En cours</p><p className="mt-1 text-2xl font-bold text-amber-900">{partialClients}</p></div><div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3"><p className="text-xs font-bold uppercase tracking-wide text-red-700">Non payés</p><p className="mt-1 text-2xl font-bold text-red-900">{unpaidClients}</p></div></div></section>

        <section aria-labelledby="activity-title" className="mt-8 border-t border-slate-200 pt-6"><div className="mb-4"><h2 id="activity-title" className="text-lg font-bold text-slate-950">Activité récente</h2></div><div className="grid gap-6 lg:grid-cols-2"><div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 px-5 py-4"><h3 className="font-bold text-slate-950">Derniers clients ajoutés</h3></div>{recentClients.length ? <ul className="divide-y divide-slate-100">{recentClients.map((client) => <li key={client.id}><Link href={`/clients/${client.id}`} className="flex items-center justify-between px-5 py-4 transition hover:bg-slate-50"><span><span className="block text-sm font-semibold text-slate-950">{client.name}</span><span className="mt-1 block text-xs text-slate-500">{client.code} · {client.packageName}</span></span><span className="text-xs text-slate-400">{new Intl.DateTimeFormat("fr-FR").format(new Date(`${client.subscriptionDate}T00:00:00`))}</span></Link></li>)}</ul> : <p className="px-5 py-8 text-sm text-slate-500">Aucun client récent.</p>}</div><div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 px-5 py-4"><h3 className="font-bold text-slate-950">Derniers paiements</h3></div>{recentPayments.length ? <ul className="divide-y divide-slate-100">{recentPayments.map((payment) => { const client = clientsById.get(payment.clientId); return <li key={payment.id}><Link href={`/clients/${payment.clientId}`} className="flex items-center justify-between px-5 py-4 transition hover:bg-slate-50"><span><span className="block text-sm font-semibold text-slate-950">{client?.name ?? "Client"}</span><span className="mt-1 block text-xs text-slate-500">{payment.method} · {new Intl.DateTimeFormat("fr-FR").format(new Date(`${payment.date}T00:00:00`))}</span></span><span className="text-sm font-bold text-emerald-700">{formatFcfa(payment.amount)}</span></Link></li>; })}</ul> : <p className="px-5 py-8 text-sm text-slate-500">Aucun paiement récent.</p>}</div></div></section>

        <section aria-labelledby="priority-title" className="mt-8 border-t border-slate-200 pt-6"><div className="mb-4 flex items-end justify-between"><div><h2 id="priority-title" className="text-lg font-bold text-slate-950">Dossiers prioritaires</h2><p className="mt-1 text-sm text-slate-500">Clients nécessitant un suivi.</p></div><Link href="/clients" className="text-sm font-semibold text-blue-700 hover:text-blue-800">Voir tous les clients</Link></div>{priorityClients.length ? <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4 font-bold">Client</th><th className="px-5 py-4 font-bold">Échéance</th><th className="px-5 py-4 font-bold">Reste à payer</th><th className="px-5 py-4 text-right font-bold">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{priorityClients.map((item) => <tr key={item.client.id} className="hover:bg-slate-50"><td className="px-5 py-4"><Link href={`/clients/${item.client.id}`} className="font-semibold text-slate-950 hover:text-blue-700">{item.client.name}</Link><p className="mt-1 text-xs text-blue-700">{item.client.code}</p></td><td className="px-5 py-4"><span className={`font-semibold ${item.due.dueStatus === "overdue" ? "text-red-700" : "text-amber-700"}`}>{item.due.dueStatus === "overdue" ? "En retard" : "À suivre"}</span></td><td className="px-5 py-4 font-semibold text-slate-700">{formatFcfa(item.totals.remainingAmount)}</td><td className="px-5 py-4 text-right"><Link href={`/clients/${item.client.id}`} className="text-sm font-semibold text-blue-700 hover:text-blue-800">Ouvrir</Link></td></tr>)}</tbody></table></div></div> : <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-sm font-medium text-emerald-800">Aucun dossier prioritaire.</div>}</section>
      </div>
    </main>
  );
}

