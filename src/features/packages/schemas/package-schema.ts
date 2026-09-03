import { z } from "zod";

const MAX_BIGINT = BigInt("9223372036854775807");
const requiredText = (label: string, maximum: number) => z.string().trim().min(1, `${label} est requis.`).max(maximum, `${label} ne doit pas dépasser ${maximum} caractères.`);

export const packageIdSchema = z.uuid({ error: "Identifiant de forfait invalide." });

export const monthlyPriceSchema = z.string()
  .trim()
  .regex(/^[1-9]\d*$/, "Le prix doit être un nombre entier strictement positif.")
  .max(19, "Le prix dépasse la valeur maximale autorisée.")
  .refine((value) => !/^[1-9]\d*$/.test(value) || BigInt(value) <= MAX_BIGINT, "Le prix dépasse la valeur maximale autorisée.");

export const createPackageSchema = z.object({
  name: requiredText("Le nom", 120),
  description: requiredText("La description", 1000),
  monthlyPrice: monthlyPriceSchema,
  isActive: z.enum(["true", "false"], { error: "Le statut est invalide." }).transform((value) => value === "true"),
});

export const updatePackageSchema = createPackageSchema.extend({ id: packageIdSchema });
export type PackageInput = z.input<typeof createPackageSchema>;
export type PackageValues = Pick<PackageInput, "name" | "description" | "monthlyPrice"> & { isActive: string };
