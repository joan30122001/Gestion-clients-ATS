"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { PaymentRecord } from "@/features/payments/infrastructure/payments-repository";
import { formatFcfa } from "@/shared/format-fcfa";

type PaymentWithClient = PaymentRecord & { clientName: string; clientCode: string };

export function PaymentsList({ payments }: { payments: PaymentWithClient[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const value = query.trim().toLocaleLowerCase("fr-FR");
    return payments.filter((payment) => !value || [payment.clientName, payment.clientCode, payment.method, payment.reference, payment.author].some((field) => field.toLocaleLowerCase("fr-FR").includes(value)));
  }, [payments, query]);
  return <>
    <div className="mb-5 flex items-center justify-between gap-4"><label className="relative block max-w-sm flex-1"><span className="sr-only">Rechercher un paiement</span><Search size={17} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un paiement..." className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label><span className="text-sm text-slate-500">{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</span></div>
  {!filtered.length ? <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">{payments.length ? "Aucun paiement ne correspond à votre recherche." : "Aucun paiement enregistré."}</div> : <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4 font-bold">Date</th><th className="px-5 py-4 font-bold">Client</th><th className="px-5 py-4 font-bold">Montant</th><th className="px-5 py-4 font-bold">Mode</th><th className="px-5 py-4 font-bold">Référence</th><th className="px-5 py-4 font-bold">Auteur</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((payment) => <tr key={payment.id} className="hover:bg-slate-50"><td className="px-5 py-4 text-slate-600">{new Intl.DateTimeFormat("fr-FR").format(new Date(`${payment.date}T00:00:00`))}</td><td className="px-5 py-4"><Link href={`/clients/${payment.clientId}`} className="font-semibold text-slate-950 hover:text-blue-700">{payment.clientName}</Link><p className="mt-1 text-xs text-blue-700">{payment.clientCode}</p></td><td className="px-5 py-4 font-bold text-slate-950">{formatFcfa(payment.amount)}</td><td className="px-5 py-4 text-slate-600">{payment.method}</td><td className="px-5 py-4 text-slate-600">{payment.reference || "-"}</td><td className="px-5 py-4 text-slate-600">{payment.author || "Administrateur"}</td></tr>)}</tbody></table></div></div>}
  </>;
}
