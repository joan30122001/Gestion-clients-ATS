"use client";

import { useState } from "react";
import { ArrowRight, CreditCard, Package as PackageIcon, UserPlus, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientForm } from "@/features/clients/ui/client-form";
import { PackageForm } from "@/features/packages/ui/package-form";
import { createClientAction } from "@/features/clients/application/client-actions";
import { createPackageAction } from "@/features/packages/application/package-actions";
import type { PackageRecord } from "@/features/packages/application/package-state";

export function DashboardActions({ packages }: { packages: PackageRecord[] }) {
  const [modal, setModal] = useState<"client" | "package" | null>(null);
  const close = () => setModal(null);

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <button type="button" onClick={() => setModal("client")} className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md">
          <span className="rounded-lg bg-blue-50 p-2.5 text-blue-700"><UserPlus size={19} aria-hidden="true" /></span><span className="flex-1"><span className="block font-bold text-slate-950">Enregistrer un client</span><span className="mt-1 block text-sm text-slate-500">Ajouter un abonnement et ses conditions.</span></span>
          <ArrowRight className="text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-700" size={18} aria-hidden="true" />
        </button>
        <button type="button" onClick={() => setModal("package")} className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-emerald-300 hover:shadow-md">
          <span className="rounded-lg bg-emerald-50 p-2.5 text-emerald-700"><PackageIcon size={19} aria-hidden="true" /></span><span className="flex-1"><span className="block font-bold text-slate-950">Créer un forfait</span><span className="mt-1 block text-sm text-slate-500">Ajouter une offre à votre catalogue.</span></span>
          <ArrowRight className="text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-emerald-700" size={18} aria-hidden="true" />
        </button>
        <a href="/paiements" className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-amber-300 hover:shadow-md">
          <span className="rounded-lg bg-amber-50 p-2.5 text-amber-700"><CreditCard size={19} aria-hidden="true" /></span><span className="flex-1"><span className="block font-bold text-slate-950">Voir les paiements</span><span className="mt-1 block text-sm text-slate-500">Suivre les derniers encaissements.</span></span>
          <ArrowRight className="text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-amber-700" size={18} aria-hidden="true" />
        </a>
        <a href="/clients?status=unpaid" className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-red-300 hover:shadow-md">
          <span className="rounded-lg bg-red-50 p-2.5 text-red-700"><Users size={19} aria-hidden="true" /></span><span className="flex-1"><span className="block font-bold text-slate-950">Voir les impayés</span><span className="mt-1 block text-sm text-slate-500">Accéder au suivi des clients.</span></span>
          <ArrowRight className="text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-red-700" size={18} aria-hidden="true" />
        </a>
      </div>
      {modal && (
        <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="quick-action-title" className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Action rapide</p><h2 id="quick-action-title" className="mt-1 text-2xl font-bold text-slate-950">{modal === "client" ? "Nouveau client" : "Nouveau forfait"}</h2></div>
              <Button type="button" aria-label="Fermer" onClick={close} className="border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100"><X size={18} aria-hidden="true" /></Button>
            </div>
            {modal === "client" ? packages.length ? <ClientForm packages={packages} onSuccess={close} /> : <p role="status">Créez d’abord un forfait actif.</p> : <PackageForm action={createPackageAction} onCancel={close} onSuccess={close} />}
          </section>
        </div>
      )}
    </>
  );
}
