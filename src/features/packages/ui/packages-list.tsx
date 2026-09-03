"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PackageRecord } from "@/features/packages/application/package-state";
import { createPackageAction, updatePackageAction } from "@/features/packages/application/package-actions";
import { PackageForm } from "@/features/packages/ui/package-form";
import { formatFcfa } from "@/shared/format-fcfa";

export function PackagesList({ packages }: { packages: PackageRecord[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  return <>
    <div className="mb-5 flex items-center justify-between gap-4"><p className="text-sm text-slate-500">{packages.length} forfait{packages.length > 1 ? "s" : ""} au catalogue</p><Button type="button" onClick={() => setCreating(true)} className="bg-blue-700 text-white hover:bg-blue-800">Nouveau forfait</Button></div>
    {!packages.length ? <div className="rounded-xl border border-dashed border-border bg-white p-8 text-center text-muted-foreground">Aucun forfait n’a encore été créé.</div> : <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.06)]"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4 font-bold">Forfait</th><th className="px-5 py-4 font-bold">Description</th><th className="px-5 py-4 font-bold">Prix mensuel</th><th className="px-5 py-4 font-bold">Statut</th><th className="px-5 py-4 text-right font-bold">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{packages.map((item) => <tr key={item.id} className="hover:bg-slate-50">
    <>
      <td className="px-5 py-4 font-bold text-slate-950">{item.name}</td><td className="max-w-xs px-5 py-4 text-slate-600">{item.description}</td><td className="px-5 py-4 font-semibold text-slate-950">{formatFcfa(item.monthlyPrice)}<span className="font-normal text-slate-500"> / mois</span></td><td className="px-5 py-4"><Badge active={item.isActive}>{item.isActive ? "Actif" : "Inactif"}</Badge></td><td className="px-5 py-4 text-right"><Button type="button" aria-label={`Modifier le forfait ${item.name}`} onClick={() => setEditing(item.id)} className="border border-border bg-white text-foreground hover:bg-slate-50">Modifier</Button></td>
    </>
  </tr>)}</tbody></table></div></div>}
    {creating && <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setCreating(false); }}><section role="dialog" aria-modal="true" aria-labelledby="new-package-title" className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"><div className="mb-6 flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Catalogue</p><h2 id="new-package-title" className="mt-1 text-2xl font-bold text-slate-950">Nouveau forfait</h2></div><Button type="button" aria-label="Fermer" onClick={() => setCreating(false)} className="border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100"><X size={18} aria-hidden="true" /></Button></div><PackageForm action={createPackageAction} onCancel={() => setCreating(false)} onSuccess={() => setCreating(false)} /></section></div>}
    {editing && <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}><section role="dialog" aria-modal="true" aria-labelledby="edit-package-title" className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"><div className="mb-6 flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Catalogue</p><h2 id="edit-package-title" className="mt-1 text-2xl font-bold text-slate-950">Modifier le forfait</h2></div><Button type="button" aria-label="Fermer" onClick={() => setEditing(null)} className="border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100"><X size={18} aria-hidden="true" /></Button></div><PackageForm action={updatePackageAction} packageItem={packages.find((item) => item.id === editing)} onCancel={() => setEditing(null)} onSuccess={() => setEditing(null)} /></section></div>}
  </>;
}
