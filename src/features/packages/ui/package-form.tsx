"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { initialPackageState, type PackageActionState, type PackageRecord } from "@/features/packages/application/package-state";

type Action = (state: PackageActionState, data: FormData) => Promise<PackageActionState>;

export function PackageForm({ action, packageItem, onCancel, onSuccess }: { action: Action; packageItem?: PackageRecord; onCancel?: () => void; onSuccess?: () => void }) {
  const [state, formAction, pending] = useActionState(action, initialPackageState);
  const [dismissed, setDismissed] = useState<{ revision: number; fields: Record<string, boolean> }>({ revision: -1, fields: {} });
  const formRef = useRef<HTMLFormElement>(null);
  const focusedRevision = useRef(-1);
  const successfulRevision = useRef(-1);
  const errors = useMemo(() => {
    const current = !state.ok && state.code === "VALIDATION_ERROR" ? state.fieldErrors : {};
    return Object.fromEntries(Object.entries(current).filter(([field]) => dismissed.revision !== state.revision || !dismissed.fields[field])) as typeof current;
  }, [state, dismissed]);
  const submitted = "values" in state ? state.values : undefined;

  useEffect(() => {
    if (state.ok && !packageItem) formRef.current?.reset();
    if (!state.ok && state.code === "VALIDATION_ERROR" && focusedRevision.current !== state.revision) {
      focusedRevision.current = state.revision;
      const first = (["name", "description", "monthlyPrice", "isActive"] as const).find((key) => errors[key]?.length);
      if (errors.id?.length) requestAnimationFrame(() => formRef.current?.focus());
      else if (first) requestAnimationFrame(() => {
        const field = formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`);
        field?.focus();
      });
    }
  }, [state, errors, packageItem]);

  useEffect(() => {
    if (state.ok && onSuccess && successfulRevision.current !== state.revision) {
      successfulRevision.current = state.revision;
      onSuccess();
    }
  }, [state, onSuccess]);

  const dismiss = (field: string) => setDismissed((current) => ({ revision: state.revision, fields: current.revision === state.revision ? { ...current.fields, [field]: true } : { [field]: true } }));

  const value = (key: "name" | "description" | "monthlyPrice") => submitted?.[key] ?? packageItem?.[key] ?? "";
  const active = submitted?.isActive ?? (packageItem?.isActive === false ? "false" : "true");
  return (
    <form ref={formRef} action={formAction} noValidate aria-busy={pending} aria-describedby={errors.id ? `id-error-${packageItem?.id ?? "new"}` : undefined} tabIndex={errors.id ? -1 : undefined} className="space-y-4">
      {packageItem && <input type="hidden" name="id" value={packageItem.id} />}
      <div className="space-y-2"><Label htmlFor={`name-${packageItem?.id ?? "new"}`}>Nom</Label><Input key={`${state.revision}-name`} id={`name-${packageItem?.id ?? "new"}`} name="name" defaultValue={value("name")} onChange={() => dismiss("name")} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? `name-error-${packageItem?.id ?? "new"}` : undefined} />{errors.name?.[0] && <p role="alert" id={`name-error-${packageItem?.id ?? "new"}`} className="text-sm text-destructive">{errors.name[0]}</p>}</div>
      <div className="space-y-2"><Label htmlFor={`description-${packageItem?.id ?? "new"}`}>Description</Label><Textarea key={`${state.revision}-description`} id={`description-${packageItem?.id ?? "new"}`} name="description" defaultValue={value("description")} onChange={() => dismiss("description")} aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? `description-error-${packageItem?.id ?? "new"}` : undefined} />{errors.description?.[0] && <p role="alert" id={`description-error-${packageItem?.id ?? "new"}`} className="text-sm text-destructive">{errors.description[0]}</p>}</div>
      <div className="space-y-2"><Label htmlFor={`price-${packageItem?.id ?? "new"}`}>Prix mensuel (FCFA)</Label><Input key={`${state.revision}-price`} id={`price-${packageItem?.id ?? "new"}`} name="monthlyPrice" inputMode="numeric" pattern="[0-9]*" defaultValue={value("monthlyPrice")} onChange={() => dismiss("monthlyPrice")} aria-invalid={Boolean(errors.monthlyPrice)} aria-describedby={errors.monthlyPrice ? `price-error-${packageItem?.id ?? "new"}` : undefined} />{errors.monthlyPrice?.[0] && <p id={`price-error-${packageItem?.id ?? "new"}`} role="alert" className="text-sm text-destructive">{errors.monthlyPrice[0]}</p>}</div>
      <fieldset className="space-y-2" aria-invalid={Boolean(errors.isActive)} aria-describedby={errors.isActive ? `status-error-${packageItem?.id ?? "new"}` : undefined}><legend className="text-sm font-medium">Statut</legend><label className="mr-5 inline-flex items-center gap-2"><input type="radio" name="isActive" value="true" defaultChecked={active === "true"} onChange={() => dismiss("isActive")} /> Actif</label><label className="inline-flex items-center gap-2"><input type="radio" name="isActive" value="false" defaultChecked={active === "false"} onChange={() => dismiss("isActive")} /> Inactif</label>{errors.isActive?.[0] && <p id={`status-error-${packageItem?.id ?? "new"}`} role="alert" className="text-sm text-destructive">{errors.isActive[0]}</p>}</fieldset>
      {errors.id?.[0] && <p id={`id-error-${packageItem?.id ?? "new"}`} role="alert" className="text-sm text-destructive">{errors.id[0]}</p>}
      {!state.ok && "message" in state && <p role="alert" className="text-sm text-destructive">{state.message}</p>}
      {state.ok && <p role="status" className="text-sm font-medium text-emerald-700">{state.data.message}</p>}
      <div className="flex flex-col gap-2 sm:flex-row"><Button type="submit" disabled={pending} className="sm:w-auto">{pending ? "Enregistrement…" : packageItem ? "Enregistrer les modifications" : "Créer le forfait"}</Button>{onCancel && <Button type="button" onClick={onCancel} disabled={pending} className="border border-border bg-white text-foreground hover:bg-slate-50 sm:w-auto">Annuler</Button>}</div>
    </form>
  );
}
