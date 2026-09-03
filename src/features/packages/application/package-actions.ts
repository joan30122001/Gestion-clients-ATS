"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AdminAccessDeniedError, AdminAccessTechnicalError, requireActiveAdmin } from "@/features/auth/application/require-active-admin";
import type { PackageActionState } from "@/features/packages/application/package-state";
import { PackagesRepository } from "@/features/packages/infrastructure/packages-repository";
import { createPackageSchema, updatePackageSchema, type PackageValues } from "@/features/packages/schemas/package-schema";

const technicalMessage = "L’opération n’a pas pu aboutir. Veuillez réessayer.";

function stringValue(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

function values(formData: FormData): PackageValues {
  return {
    name: stringValue(formData.get("name")),
    description: stringValue(formData.get("description")),
    monthlyPrice: stringValue(formData.get("monthlyPrice")),
    isActive: stringValue(formData.get("isActive")),
  };
}

function failure(error: unknown, revision: number, submitted: PackageValues): PackageActionState {
  if (error instanceof AdminAccessDeniedError) return { ok: false, code: "ACCESS_DENIED", revision, message: "Accès non autorisé.", values: submitted };
  console.error("Échec technique pendant l’enregistrement d’un forfait.");
  return { ok: false, code: "TECHNICAL_ERROR", revision, message: technicalMessage, values: submitted };
}

export async function createPackageAction(previous: PackageActionState, formData: FormData): Promise<PackageActionState> {
  const revision = previous.revision + 1;
  const submitted = values(formData);
  try { await requireActiveAdmin(); }
  catch (error) {
    if (error instanceof AdminAccessDeniedError) redirect("/login");
    if (error instanceof AdminAccessTechnicalError) return failure(error, revision, submitted);
    return failure(error, revision, submitted);
  }
  const parsed = createPackageSchema.safeParse(submitted);
  if (!parsed.success) return { ok: false, code: "VALIDATION_ERROR", revision, fieldErrors: parsed.error.flatten().fieldErrors, values: submitted };

  try {
    await new PackagesRepository().create(parsed.data);
    revalidatePath("/forfaits");
    return { ok: true, revision, data: { message: "Forfait créé avec succès." } };
  } catch (error) {
    return failure(error, revision, submitted);
  }
}

export async function updatePackageAction(previous: PackageActionState, formData: FormData): Promise<PackageActionState> {
  const revision = previous.revision + 1;
  const submitted = values(formData);
  try { await requireActiveAdmin(); }
  catch (error) {
    if (error instanceof AdminAccessDeniedError) redirect("/login");
    if (error instanceof AdminAccessTechnicalError) return failure(error, revision, submitted);
    return failure(error, revision, submitted);
  }
  const parsed = updatePackageSchema.safeParse({ ...submitted, id: String(formData.get("id") ?? "") });
  if (!parsed.success) return { ok: false, code: "VALIDATION_ERROR", revision, fieldErrors: parsed.error.flatten().fieldErrors, values: submitted };

  try {
    const updated = await new PackagesRepository().update(parsed.data);
    if (!updated) return { ok: false, code: "NOT_FOUND", revision, message: "Ce forfait n’existe plus.", values: submitted };
    revalidatePath("/forfaits");
    return { ok: true, revision, data: { message: "Forfait modifié avec succès." } };
  } catch (error) {
    return failure(error, revision, submitted);
  }
}
