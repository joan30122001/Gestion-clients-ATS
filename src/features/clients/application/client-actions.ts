"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AdminAccessDeniedError, requireActiveAdmin } from "@/features/auth/application/require-active-admin";
import type { ClientActionState } from "@/features/clients/application/client-state";
import { isCustomContractTotal } from "@/features/clients/domain/client-contract";
import { ClientsRepository } from "@/features/clients/infrastructure/clients-repository";
import { clientSchema, type ClientValues } from "@/features/clients/schemas/client-schema";
import { PackagesRepository } from "@/features/packages/infrastructure/packages-repository";
import { SubscriptionsRepository } from "@/features/subscriptions/infrastructure/subscriptions-repository";

function values(data: FormData): ClientValues {
  const get = (key: keyof ClientValues) => typeof data.get(key) === "string" ? String(data.get(key)) : "";
  return { name: get("name"), phone: get("phone"), location: get("location"), subscriptionDate: get("subscriptionDate"), packageId: get("packageId"), durationMonths: get("durationMonths"), monthlyAmount: get("monthlyAmount"), totalAmount: get("totalAmount"), notes: get("notes") };
}

export async function createClientAction(previous: ClientActionState, formData: FormData): Promise<ClientActionState> {
  const revision = previous.revision + 1;
  const submitted = values(formData);
  try { await requireActiveAdmin(); } catch (error) {
    if (error instanceof AdminAccessDeniedError) redirect("/login");
    return { ok: false, code: "TECHNICAL_ERROR", revision, message: "L’opération n’a pas pu aboutir. Veuillez réessayer.", values: submitted };
  }
  const parsed = clientSchema.safeParse(submitted);
  if (!parsed.success) return { ok: false, code: "VALIDATION_ERROR", revision, fieldErrors: parsed.error.flatten().fieldErrors, values: submitted };
  try {
    const selectedPackage = await new PackagesRepository().findActive(parsed.data.packageId);
    if (!selectedPackage) return { ok: false, code: "PACKAGE_UNAVAILABLE", revision, message: "Le forfait sélectionné est indisponible ou inactif.", values: submitted };
    const customTotal = isCustomContractTotal(parsed.data.durationMonths, parsed.data.monthlyAmount, parsed.data.totalAmount);
    const client = await new ClientsRepository().create({ ...parsed.data, packageName: selectedPackage.name, packageDescription: selectedPackage.description, packageMonthlyPrice: selectedPackage.monthlyPrice, customTotal });
    revalidatePath("/clients");
    return { ok: true, revision, data: { message: `Client ${client.code} enregistré avec succès.`, clientCode: client.code, customTotal } };
  } catch {
    console.error("Échec technique pendant l’enregistrement du client.");
    return { ok: false, code: "TECHNICAL_ERROR", revision, message: "L’opération n’a pas pu aboutir. Veuillez réessayer.", values: submitted };
  }
}

export async function updateClientAction(previous: ClientActionState, formData: FormData): Promise<ClientActionState> {
  const revision = previous.revision + 1;
  const submitted = values(formData);
  try { await requireActiveAdmin(); } catch (error) {
    if (error instanceof AdminAccessDeniedError) redirect("/login");
    return { ok: false, code: "TECHNICAL_ERROR", revision, message: "L’opération n’a pas pu aboutir. Veuillez réessayer.", values: submitted };
  }
  const id = String(formData.get("id") ?? "");
  const parsed = clientSchema.safeParse(submitted);
  if (!parsed.success) return { ok: false, code: "VALIDATION_ERROR", revision, fieldErrors: parsed.error.flatten().fieldErrors, values: submitted };
  try {
    const selectedPackage = await new PackagesRepository().findActive(parsed.data.packageId);
    if (!selectedPackage) return { ok: false, code: "PACKAGE_UNAVAILABLE", revision, message: "Le forfait sélectionné est indisponible ou inactif.", values: submitted };
    const customTotal = isCustomContractTotal(parsed.data.durationMonths, parsed.data.monthlyAmount, parsed.data.totalAmount);
    const client = await new ClientsRepository().update(id, { ...parsed.data, packageName: selectedPackage.name, packageDescription: selectedPackage.description, packageMonthlyPrice: selectedPackage.monthlyPrice, customTotal });
    if (!client) return { ok: false, code: "TECHNICAL_ERROR", revision, message: "Ce client n’existe plus.", values: submitted };
    revalidatePath("/clients"); revalidatePath(`/clients/${id}`);
    return { ok: true, revision, data: { message: `Client ${client.code} modifié avec succès.`, clientCode: client.code, customTotal } };
  } catch {
    console.error("Échec technique pendant la modification du client.");
    return { ok: false, code: "TECHNICAL_ERROR", revision, message: "L’opération n’a pas pu aboutir. Veuillez réessayer.", values: submitted };
  }
}

export async function removeClientAction(formData: FormData): Promise<{ ok: boolean; message: string }> {
  try { await requireActiveAdmin(); } catch (error) {
    if (error instanceof AdminAccessDeniedError) redirect("/login");
    return { ok: false, message: "L’opération n’a pas pu aboutir." };
  }
  const id = String(formData.get("id") ?? "");
  try {
    const removed = await new ClientsRepository().remove(id);
    if (!removed) return { ok: false, message: "Ce client n’existe plus." };
    revalidatePath("/clients"); revalidatePath(`/clients/${id}`);
    return { ok: true, message: "Client retiré de l’activité." };
  } catch {
    console.error("Échec technique pendant le retrait du client.");
    return { ok: false, message: "L’opération n’a pas pu aboutir." };
  }
}

export async function createSubscriptionAction(previous: ClientActionState, formData: FormData): Promise<ClientActionState> {
  const revision = previous.revision + 1;
  const submitted = values(formData);
  try { await requireActiveAdmin(); } catch (error) {
    if (error instanceof AdminAccessDeniedError) redirect("/login");
    return { ok: false, code: "TECHNICAL_ERROR", revision, message: "L’opération n’a pas pu aboutir.", values: submitted };
  }
  const clientId = String(formData.get("clientId") ?? "");
  const parsed = clientSchema.safeParse(submitted);
  if (!parsed.success) return { ok: false, code: "VALIDATION_ERROR", revision, fieldErrors: parsed.error.flatten().fieldErrors, values: submitted };
  try {
    const clients = new ClientsRepository();
    const client = await clients.findById(clientId);
    const selectedPackage = await new PackagesRepository().findActive(parsed.data.packageId);
    if (!client) return { ok: false, code: "TECHNICAL_ERROR", revision, message: "Ce client n’existe plus.", values: submitted };
    if (!selectedPackage) return { ok: false, code: "PACKAGE_UNAVAILABLE", revision, message: "Le forfait sélectionné est indisponible ou inactif.", values: submitted };
    const customTotal = isCustomContractTotal(parsed.data.durationMonths, parsed.data.monthlyAmount, parsed.data.totalAmount);
    const contract = { ...parsed.data, packageName: selectedPackage.name, packageDescription: selectedPackage.description, packageMonthlyPrice: selectedPackage.monthlyPrice, customTotal };
    const subscriptions = new SubscriptionsRepository();
    if (!(await subscriptions.listByClient(clientId)).length) {
      await subscriptions.create({ clientId, packageId: client.packageId, packageName: client.packageName, packageDescription: client.packageDescription, packageMonthlyPrice: client.packageMonthlyPrice, subscriptionDate: client.subscriptionDate, durationMonths: client.durationMonths, monthlyAmount: client.monthlyAmount, totalAmount: client.totalAmount, customTotal: client.customTotal, endedAt: parsed.data.subscriptionDate });
    }
    await subscriptions.create({ clientId, ...contract });
    const updated = await clients.update(clientId, { ...contract, notes: client.notes });
    if (!updated) return { ok: false, code: "TECHNICAL_ERROR", revision, message: "Ce client n’existe plus.", values: submitted };
    revalidatePath(`/clients/${clientId}`); revalidatePath("/clients");
    return { ok: true, revision, data: { message: `Nouvel abonnement enregistré pour ${updated.code}.`, clientCode: updated.code, customTotal } };
  } catch {
    console.error("Échec technique pendant l’enregistrement de l’abonnement.");
    return { ok: false, code: "TECHNICAL_ERROR", revision, message: "L’opération n’a pas pu aboutir.", values: submitted };
  }
}
