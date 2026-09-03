import { z } from "zod";

const MAX = BigInt("9223372036854775807");
const text = (label: string, max: number) => z.string().trim().min(1, `${label} est requis.`).max(max, `${label} ne doit pas dépasser ${max} caractères.`);
const positiveInteger = (label: string) => z.string().trim().regex(/^[1-9]\d*$/, `${label} doit être un entier strictement positif.`)
  .refine((value) => !/^[1-9]\d*$/.test(value) || BigInt(value) <= MAX, `${label} dépasse la valeur maximale autorisée.`);

function isValidCivilDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function normalizeCameroonPhone(value: string): string | null {
  let digits = value.trim().replace(/[\s().-]/g, "");
  if (digits.startsWith("+237")) digits = digits.slice(4);
  else if (digits.startsWith("00237")) digits = digits.slice(5);
  else if (digits.startsWith("237") && digits.length === 12) digits = digits.slice(3);
  if (!/^[26]\d{8}$/.test(digits)) return null;
  return `+237${digits}`;
}

const phone = z.string().trim().transform((value, context) => {
  const normalized = normalizeCameroonPhone(value);
  if (!normalized) { context.addIssue({ code: "custom", message: "Saisissez un numéro camerounais valide." }); return z.NEVER; }
  return normalized;
});

export const clientSchema = z.object({
  name: text("Le nom", 160), phone, location: text("La localisation", 200),
  subscriptionDate: z.string().refine(isValidCivilDate, "La date d’abonnement est invalide."),
  packageId: z.string().uuid("Le forfait sélectionné est invalide."),
  durationMonths: positiveInteger("La durée"), monthlyAmount: positiveInteger("La mensualité"), totalAmount: positiveInteger("Le montant total"),
  notes: z.string().trim().max(2000, "Les notes ne doivent pas dépasser 2000 caractères.").optional().default(""),
});

export type ClientValues = { name: string; phone: string; location: string; subscriptionDate: string; packageId: string; durationMonths: string; monthlyAmount: string; totalAmount: string; notes: string };
