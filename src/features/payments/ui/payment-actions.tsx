"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentForm } from "@/features/payments/ui/payment-form";

export function PaymentActions({ clientId }: { clientId: string }) {
  const [open, setOpen] = useState(false);
  return <><Button type="button" onClick={() => setOpen(true)} className="bg-blue-700 text-white hover:bg-blue-800">Ajouter un paiement</Button>{open && <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><section role="dialog" aria-modal="true" aria-labelledby="new-payment-title" className="max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"><div className="mb-6 flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Encaissement</p><h2 id="new-payment-title" className="mt-1 text-2xl font-bold text-slate-950">Ajouter un paiement</h2></div><Button type="button" aria-label="Fermer" onClick={() => setOpen(false)} className="border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100"><X size={18} aria-hidden="true" /></Button></div><PaymentForm clientId={clientId} onSuccess={() => setOpen(false)} /></section></div>}</>;
}
