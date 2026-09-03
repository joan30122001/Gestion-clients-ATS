"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClientAction } from "@/features/clients/application/client-actions";
import { initialClientState, type ClientActionState } from "@/features/clients/application/client-state";
import type { ClientRecord } from "@/features/clients/infrastructure/clients-repository";
import type { PackageRecord } from "@/features/packages/application/package-state";

const fields = ["name", "phone", "location", "subscriptionDate", "packageId", "durationMonths", "monthlyAmount", "totalAmount", "notes"] as const;

type Action = (state: ClientActionState, data: FormData) => Promise<ClientActionState>;

export function ClientForm({ packages, clientItem, clientId, subscriptionMode = false, action = createClientAction, onSuccess }: { packages: PackageRecord[]; clientItem?: ClientRecord; clientId?: string; subscriptionMode?: boolean; action?: Action; onSuccess?: () => void }) {
  const [state, formAction, pending] = useActionState(action, initialClientState);
  const [duration, setDuration] = useState(clientItem?.durationMonths ?? "1");
  const [monthly, setMonthly] = useState(clientItem?.monthlyAmount ?? packages[0]?.monthlyPrice ?? "");
  const [total, setTotal] = useState(clientItem?.totalAmount ?? packages[0]?.monthlyPrice ?? "");
  const [custom, setCustom] = useState(clientItem?.customTotal ?? false);
  const form = useRef<HTMLFormElement>(null);
  const errors = useMemo(() => !state.ok && state.code === "VALIDATION_ERROR" ? state.fieldErrors : {}, [state]);

  useEffect(() => {
    const first = fields.find((field) => errors[field]?.length);
    if (first) requestAnimationFrame(() => form.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus());
  }, [state.revision, errors]);

  useEffect(() => {
    if (state.ok) onSuccess?.();
  }, [state, onSuccess]);

  function calculated(nextDuration = duration, nextMonthly = monthly) {
    if (!/^\d+$/.test(nextDuration) || !/^\d+$/.test(nextMonthly)) return "";
    return (BigInt(nextDuration) * BigInt(nextMonthly)).toString();
  }
  function refresh(nextDuration: string, nextMonthly: string) {
    setDuration(nextDuration); setMonthly(nextMonthly);
    if (!custom) setTotal(calculated(nextDuration, nextMonthly));
  }
  const submitted = "values" in state ? state.values : undefined;
  const error = (name: typeof fields[number]) => errors[name]?.[0];
  const field = (name: typeof fields[number], label: string, input: React.ReactNode) => <div className="space-y-2"><Label htmlFor={name}>{label}</Label>{input}{error(name) && <p id={`${name}-error`} role="alert" className="text-sm text-destructive">{error(name)}</p>}</div>;

  return <form ref={form} action={formAction} noValidate aria-busy={pending} className="space-y-6">
    {clientItem && <input type="hidden" name="id" value={clientItem.id} />}
    {clientId && <input type="hidden" name="clientId" value={clientId} />}
    {subscriptionMode && <div className="rounded-lg border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Client concerné</p><p className="mt-1 font-semibold text-slate-950">{clientItem?.name}</p><p className="mt-1 text-sm text-slate-500">{clientItem?.phone} · {clientItem?.location}</p><input type="hidden" name="name" value={clientItem?.name ?? ""} /><input type="hidden" name="phone" value={clientItem?.phone ?? ""} /><input type="hidden" name="location" value={clientItem?.location ?? ""} /><input type="hidden" name="subscriptionDate" value={new Date().toISOString().slice(0, 10)} /><input type="hidden" name="notes" value={clientItem?.notes ?? ""} /></div>}
    <div className="grid gap-5 md:grid-cols-2">
      {!subscriptionMode && <>{field("name", "Nom complet", <Input id="name" name="name" defaultValue={submitted?.name ?? clientItem?.name} aria-invalid={Boolean(error("name"))} aria-describedby={error("name") ? "name-error" : undefined} />)}
      {field("phone", "Téléphone", <Input id="phone" name="phone" type="tel" placeholder="6 99 00 00 00" defaultValue={submitted?.phone ?? clientItem?.phone} aria-invalid={Boolean(error("phone"))} aria-describedby={error("phone") ? "phone-error" : undefined} />)}
      {field("location", "Localisation", <Input id="location" name="location" defaultValue={submitted?.location ?? clientItem?.location} aria-invalid={Boolean(error("location"))} aria-describedby={error("location") ? "location-error" : undefined} />)}
      {field("subscriptionDate", "Date d’abonnement", <Input id="subscriptionDate" name="subscriptionDate" type="date" defaultValue={submitted?.subscriptionDate ?? clientItem?.subscriptionDate ?? new Date().toISOString().slice(0, 10)} aria-invalid={Boolean(error("subscriptionDate"))} aria-describedby={error("subscriptionDate") ? "subscriptionDate-error" : undefined} />)}</>}
      {field("packageId", "Forfait", <select id="packageId" name="packageId" defaultValue={submitted?.packageId ?? clientItem?.packageId ?? packages[0]?.id ?? ""} onChange={(event) => { const item = packages.find((entry) => entry.id === event.target.value); if (item) { setCustom(false); refresh(duration, item.monthlyPrice); setTotal(calculated(duration, item.monthlyPrice)); } }} className="flex h-11 w-full rounded-md border border-input bg-white px-3 text-sm" aria-invalid={Boolean(error("packageId"))} aria-describedby={error("packageId") ? "packageId-error" : undefined}><option value="" disabled>Sélectionnez un forfait</option>{packages.map((item) => <option key={item.id} value={item.id}>{item.name} — {item.monthlyPrice} FCFA/mois</option>)}</select>)}
      {field("durationMonths", "Durée (mois)", <Input id="durationMonths" name="durationMonths" inputMode="numeric" value={duration} onChange={(event) => refresh(event.target.value, monthly)} aria-invalid={Boolean(error("durationMonths"))} aria-describedby={error("durationMonths") ? "durationMonths-error" : undefined} />)}
      {field("monthlyAmount", "Mensualité (FCFA)", <Input id="monthlyAmount" name="monthlyAmount" inputMode="numeric" value={monthly} onChange={(event) => refresh(duration, event.target.value)} aria-invalid={Boolean(error("monthlyAmount"))} aria-describedby={error("monthlyAmount") ? "monthlyAmount-error" : undefined} />)}
      {field("totalAmount", "Montant contractuel total (FCFA)", <Input id="totalAmount" name="totalAmount" inputMode="numeric" value={total} onChange={(event) => { const value = event.target.value; setTotal(value); setCustom(value !== calculated()); }} aria-invalid={Boolean(error("totalAmount"))} aria-describedby={`${error("totalAmount") ? "totalAmount-error " : ""}total-help`} />)}
    </div>
    <p id="total-help" role="status" className={`rounded-md border p-3 text-sm ${custom ? "border-amber-300 bg-amber-50 text-amber-900" : "border-blue-200 bg-blue-50 text-blue-900"}`}>{custom ? "Montant personnalisé : cette valeur remplacera le total calculé." : `Total calculé automatiquement : ${total || "—"} FCFA.`}</p>
    {!subscriptionMode && field("notes", "Notes (facultatif)", <Textarea id="notes" name="notes" rows={4} defaultValue={submitted?.notes ?? clientItem?.notes} aria-invalid={Boolean(error("notes"))} aria-describedby={error("notes") ? "notes-error" : undefined} />)}
    {!state.ok && (state.code === "PACKAGE_UNAVAILABLE" || state.code === "TECHNICAL_ERROR") && <p role="alert" className="text-sm text-destructive">{state.message}</p>}
    {state.ok && <p role="status" className="rounded-md bg-emerald-50 p-3 text-sm font-medium text-emerald-800">{state.data.message}{state.data.customTotal ? " Montant personnalisé enregistré." : ""}</p>}
    <Button type="submit" disabled={pending || packages.length === 0}>{pending ? "Enregistrement…" : clientItem ? "Enregistrer les modifications" : "Enregistrer le client"}</Button>
  </form>;
}
