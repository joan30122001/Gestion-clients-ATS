"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AdminAccessDeniedError, requireActiveAdmin } from "@/features/auth/application/require-active-admin";
import { ClientsRepository } from "@/features/clients/infrastructure/clients-repository";
import type { PaymentActionState } from "@/features/payments/application/payment-state";
import { PaymentsRepository } from "@/features/payments/infrastructure/payments-repository";
import { paymentSchema, type PaymentValues } from "@/features/payments/schemas/payment-schema";

function values(formData: FormData): PaymentValues {
  const get = (key: keyof PaymentValues) => typeof formData.get(key) === "string" ? String(formData.get(key)) : "";
  return { clientId: get("clientId"), amount: get("amount"), date: get("date"), method: get("method"), reference: get("reference"), note: get("note") };
}

export async function createPaymentAction(previous: PaymentActionState, formData: FormData): Promise<PaymentActionState> {
  const revision = previous.revision + 1;
  const submitted = values(formData);
  try { await requireActiveAdmin(); } catch (error) {
    if (error instanceof AdminAccessDeniedError) redirect("/login");
    return { ok: false, code: "TECHNICAL_ERROR", revision, message: "L’opération n’a pas pu aboutir.", values: submitted };
  }
  const parsed = paymentSchema.safeParse(submitted);
  if (!parsed.success) return { ok: false, code: "VALIDATION_ERROR", revision, fieldErrors: parsed.error.flatten().fieldErrors, values: submitted };
  try {
    const client = await new ClientsRepository().findById(parsed.data.clientId);
    if (!client) return { ok: false, code: "CLIENT_NOT_FOUND", revision, message: "Ce client n’existe plus.", values: submitted };
    const payments = new PaymentsRepository();
    const totalPaid = await payments.totalByClient(client.id);
    if (totalPaid + BigInt(parsed.data.amount) > BigInt(client.totalAmount)) return { ok: false, code: "AMOUNT_EXCEEDED", revision, message: "Le paiement dépasse le montant restant dû.", values: submitted };
    await payments.create({ ...parsed.data, author: "Administrateur" });
    revalidatePath(`/clients/${client.id}`); revalidatePath("/clients");
    return { ok: true, revision, data: { message: "Paiement enregistré avec succès." } };
  } catch {
    console.error("Échec technique pendant l’enregistrement du paiement.");
    return { ok: false, code: "TECHNICAL_ERROR", revision, message: "L’opération n’a pas pu aboutir.", values: submitted };
  }
}
