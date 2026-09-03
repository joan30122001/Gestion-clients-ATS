"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPaymentAction } from "@/features/payments/application/payment-actions";
import { initialPaymentState } from "@/features/payments/application/payment-state";
import { paymentMethods } from "@/features/payments/schemas/payment-schema";

export function PaymentForm({ clientId, onSuccess }: { clientId: string; onSuccess: () => void }) {
  const [state, action, pending] = useActionState(createPaymentAction, initialPaymentState);
  const errors = !state.ok && state.code === "VALIDATION_ERROR" ? state.fieldErrors : {};
  useEffect(() => { if (state.ok) onSuccess(); }, [state, onSuccess]);
  const error = (field: keyof typeof errors) => errors[field]?.[0];
  return <form action={action} noValidate className="space-y-4"><input type="hidden" name="clientId" value={clientId} /><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="payment-amount">Montant (FCFA)</Label><Input id="payment-amount" name="amount" inputMode="numeric" placeholder="25000" aria-invalid={Boolean(error("amount"))} />{error("amount") && <p role="alert" className="text-sm text-red-600">{error("amount")}</p>}</div><div className="space-y-2"><Label htmlFor="payment-date">Date du paiement</Label><Input id="payment-date" name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} aria-invalid={Boolean(error("date"))} />{error("date") && <p role="alert" className="text-sm text-red-600">{error("date")}</p>}</div></div><div className="space-y-2"><Label htmlFor="payment-method">Mode de paiement</Label><select id="payment-method" name="method" defaultValue="" className="flex h-11 w-full rounded-md border border-input bg-white px-3 text-sm"><option value="" disabled>Sélectionnez un mode</option>{paymentMethods.map((method) => <option key={method} value={method}>{method}</option>)}</select>{error("method") && <p role="alert" className="text-sm text-red-600">{error("method")}</p>}</div><div className="space-y-2"><Label htmlFor="payment-reference">Référence (facultatif)</Label><Input id="payment-reference" name="reference" placeholder="Référence de transaction" /></div><div className="space-y-2"><Label htmlFor="payment-note">Observation (facultatif)</Label><Textarea id="payment-note" name="note" rows={3} placeholder="Ajouter une observation" /></div>{!state.ok && "message" in state && <p role="alert" className="text-sm text-red-600">{state.message}</p>}<div className="flex justify-end"><Button type="submit" disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer le paiement"}</Button></div></form>;
}
