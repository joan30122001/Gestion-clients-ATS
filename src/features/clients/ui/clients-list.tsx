"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Search, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateClientAction } from "@/features/clients/application/client-actions";
import { removeClientAction } from "@/features/clients/application/client-actions";
import { ClientForm } from "@/features/clients/ui/client-form";
import type { ClientRecord } from "@/features/clients/infrastructure/clients-repository";
import type { PackageRecord } from "@/features/packages/application/package-state";
import { formatFcfa } from "@/shared/format-fcfa";
import type { PaymentStatus } from "@/features/payments/domain/payment-status";
import type { DueStatus } from "@/features/payments/domain/payment-due";
import { ClientFinanceBadge } from "@/features/clients/ui/client-finance-badge";

export type ClientListItem = ClientRecord & { paidAmount: string; remainingAmount: string; status: PaymentStatus; dueStatus: DueStatus; nextDueDate: string };

export function ClientsList({ clients, packages, initialStatus = "all" }: { clients: ClientListItem[]; packages: PackageRecord[]; initialStatus?: string }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ClientRecord | null>(null);
  const [removing, setRemoving] = useState<ClientRecord | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(initialStatus);
  const [packageId, setPackageId] = useState("all");
  const filteredClients = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("fr-FR");
    return clients.filter((client) => {
      const matchesSearch = !query || [client.name, client.phone, client.code, client.location].some((value) => value.toLocaleLowerCase("fr-FR").includes(query));
      const matchesPackage = packageId === "all" || client.packageId === packageId;
      return matchesSearch && matchesPackage && (status === "all" || status === client.status);
    });
  }, [clients, packageId, search, status]);
  function removeClient() {
    if (!removing) return;
    const formData = new FormData(); formData.set("id", removing.id);
    startTransition(async () => { const result = await removeClientAction(formData); if (result.ok) { setRemoving(null); router.refresh(); } });
  }
  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex flex-1 flex-col gap-3 sm:flex-row"><label className="relative block max-w-sm flex-1"><span className="sr-only">Rechercher un client</span><Search size={17} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un client..." className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label><select aria-label="Filtrer par statut" value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-lg border border-dashed border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700"><option value="all">Tous les statuts</option><option value="unpaid">Non payé</option><option value="partial">Paiement en cours</option><option value="paid">Soldé</option></select><select aria-label="Filtrer par forfait" value={packageId} onChange={(event) => setPackageId(event.target.value)} className="h-10 rounded-lg border border-dashed border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700"><option value="all">Tous les forfaits</option>{packages.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div><Button type="button" onClick={() => setOpen(true)} className="bg-blue-700 text-white hover:bg-blue-800">Nouveau client</Button></div>
      {!filteredClients.length ? <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">{clients.length ? "Aucun client ne correspond à ces critères." : "Aucun client n’a encore été enregistré."}</div> : <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.06)]"><div className="overflow-x-auto"><table className="w-full min-w-[1120px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4 font-bold">Client</th><th className="px-5 py-4 font-bold">Contact</th><th className="px-5 py-4 font-bold">Forfait</th><th className="px-5 py-4 font-bold">Montant contractuel</th><th className="px-5 py-4 font-bold">Payé</th><th className="px-5 py-4 font-bold">Reste</th><th className="px-5 py-4 font-bold">Statut</th><th className="px-5 py-4 font-bold">Échéance</th><th className="px-5 py-4 text-right font-bold">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredClients.map((client) => <tr key={client.id} className="hover:bg-slate-50"><td className="px-5 py-4"><Link href={`/clients/${client.id}`} className="group block"><p className="font-bold text-slate-950 group-hover:text-blue-700">{client.name}</p><p className="mt-1 text-xs font-semibold text-blue-700">{client.code}</p></Link></td><td className="px-5 py-4 text-slate-600"><p>{client.phone}</p><p className="mt-1 text-xs text-slate-400">{client.location}</p></td><td className="px-5 py-4 text-slate-600">{client.packageName}</td><td className="px-5 py-4 font-semibold text-slate-950">{formatFcfa(client.totalAmount)}</td><td className="px-5 py-4 text-slate-600">{formatFcfa(client.paidAmount)}</td><td className="px-5 py-4 font-semibold text-slate-700">{formatFcfa(client.remainingAmount)}</td><td className="px-5 py-4"><ClientFinanceBadge status={client.status} /></td><td className="px-5 py-4"><p className={`text-sm font-semibold ${client.dueStatus === "overdue" ? "text-red-700" : client.dueStatus === "complete" ? "text-slate-400" : "text-amber-700"}`}>{client.dueStatus === "complete" ? "Terminé" : client.dueStatus === "overdue" ? "En retard" : "À venir"}</p><p className="mt-1 text-xs text-slate-500">{new Intl.DateTimeFormat("fr-FR").format(new Date(`${client.nextDueDate}T00:00:00`))}</p></td><td className="px-5 py-4 text-right"><div className="flex justify-end gap-2"><Button type="button" onClick={() => setEditing(client)} className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">Modifier</Button><Button type="button" aria-label={`Retirer ${client.name}`} onClick={() => setRemoving(client)} className="border border-red-200 bg-white p-2 text-red-600 hover:bg-red-50"><Trash2 size={17} aria-hidden="true" /></Button></div></td></tr>)}</tbody></table></div></div>}
      {open && <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><section role="dialog" aria-modal="true" aria-labelledby="new-client-title" className="max-h-[90dvh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"><div className="mb-6 flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Portefeuille</p><h2 id="new-client-title" className="mt-1 text-2xl font-bold text-slate-950">Nouveau client</h2></div><Button type="button" aria-label="Fermer" onClick={() => setOpen(false)} className="border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100"><X size={18} aria-hidden="true" /></Button></div>{packages.length ? <ClientForm packages={packages} onSuccess={() => setOpen(false)} /> : <p role="status">Créez d’abord un forfait actif.</p>}</section></div>}
      {editing && <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}><section role="dialog" aria-modal="true" aria-labelledby="edit-client-title" className="max-h-[90dvh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"><div className="mb-6 flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Portefeuille</p><h2 id="edit-client-title" className="mt-1 text-2xl font-bold text-slate-950">Modifier le client</h2></div><Button type="button" aria-label="Fermer" onClick={() => setEditing(null)} className="border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100"><X size={18} aria-hidden="true" /></Button></div><ClientForm packages={packages} clientItem={editing} action={updateClientAction} onSuccess={() => setEditing(null)} /></section></div>}
      {removing && <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setRemoving(null); }}><section role="alertdialog" aria-modal="true" aria-labelledby="remove-client-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><h2 id="remove-client-title" className="text-xl font-bold text-slate-950">Retirer ce client ?</h2><p className="mt-3 text-sm leading-6 text-slate-600">{removing.name} disparaîtra des listes actives. Son historique et ses données seront conservés.</p><div className="mt-6 flex justify-end gap-3"><Button type="button" onClick={() => setRemoving(null)} disabled={pending} className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">Annuler</Button><Button type="button" onClick={removeClient} disabled={pending} className="bg-red-600 text-white hover:bg-red-700">{pending ? "Retrait…" : "Confirmer le retrait"}</Button></div></section></div>}
    </>
  );
}
