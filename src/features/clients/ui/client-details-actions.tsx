"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientForm } from "@/features/clients/ui/client-form";
import { updateClientAction } from "@/features/clients/application/client-actions";
import { createSubscriptionAction } from "@/features/clients/application/client-actions";
import type { ClientRecord } from "@/features/clients/infrastructure/clients-repository";
import type { PackageRecord } from "@/features/packages/application/package-state";

export function ClientDetailsActions({ client, packages }: { client: ClientRecord; packages: PackageRecord[] }) {
  const [open, setOpen] = useState(false);
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);
  return <>
    <div className="flex gap-2"><Button type="button" onClick={() => setSubscriptionOpen(true)} className="bg-blue-700 text-white hover:bg-blue-800">Nouvel abonnement</Button><Button type="button" onClick={() => setOpen(true)} className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">Modifier</Button></div>
    {open && <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><section role="dialog" aria-modal="true" aria-labelledby="edit-client-title" className="max-h-[90dvh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"><div className="mb-6 flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Portefeuille</p><h2 id="edit-client-title" className="mt-1 text-2xl font-bold text-slate-950">Modifier le client</h2></div><Button type="button" aria-label="Fermer" onClick={() => setOpen(false)} className="border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100"><X size={18} aria-hidden="true" /></Button></div><ClientForm packages={packages} clientItem={client} action={updateClientAction} onSuccess={() => setOpen(false)} /></section></div>}
    {subscriptionOpen && <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setSubscriptionOpen(false); }}><section role="dialog" aria-modal="true" aria-labelledby="new-subscription-title" className="max-h-[90dvh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"><div className="mb-6 flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Renouvellement</p><h2 id="new-subscription-title" className="mt-1 text-2xl font-bold text-slate-950">Nouvel abonnement</h2><p className="mt-1 text-sm text-slate-500">Les informations du client sont conservées. Modifiez uniquement le forfait et les conditions.</p></div><Button type="button" aria-label="Fermer" onClick={() => setSubscriptionOpen(false)} className="border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100"><X size={18} aria-hidden="true" /></Button></div><ClientForm packages={packages.filter((item) => item.isActive)} clientItem={client} clientId={client.id} subscriptionMode action={createSubscriptionAction} onSuccess={() => setSubscriptionOpen(false)} /></section></div>}
  </>;
}
