import { z } from "zod";

const MAX = BigInt("9223372036854775807");
const positiveAmount = z.string().trim().regex(/^[1-9]\d*$/, "Le montant doit être un entier strictement positif.").refine((value) => BigInt(value) <= MAX, "Le montant dépasse la valeur maximale autorisée.");
const paymentMethods = ["Espèces", "Mobile Money", "Orange Money", "MTN MoMo", "Virement bancaire", "Autre"] as const;

export const paymentSchema = z.object({
  clientId: z.string().uuid("Le client est invalide."),
  amount: positiveAmount,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La date du paiement est invalide."),
  method: z.enum(paymentMethods, { error: "Sélectionnez un mode de paiement." }),
  reference: z.string().trim().max(120, "La référence ne doit pas dépasser 120 caractères.").default(""),
  note: z.string().trim().max(500, "L’observation ne doit pas dépasser 500 caractères.").default(""),
});

export type PaymentValues = { clientId: string; amount: string; date: string; method: string; reference: string; note: string };
export { paymentMethods };
