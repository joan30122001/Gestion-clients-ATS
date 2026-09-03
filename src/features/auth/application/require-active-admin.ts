import "server-only";

import { hasValidLocalAdminSession } from "@/features/auth/infrastructure/local-admin-session";

export type ActiveAdmin = { role: "ADMIN" };

export class AdminAccessDeniedError extends Error {
  constructor() {
    super("Accès administrateur requis.");
    this.name = "AdminAccessDeniedError";
  }
}

export class AdminAccessTechnicalError extends Error {
  constructor() {
    super("La vérification de l’accès administrateur a échoué.");
    this.name = "AdminAccessTechnicalError";
  }
}

export async function requireActiveAdmin(): Promise<ActiveAdmin> {
  try {
    if (!await hasValidLocalAdminSession()) throw new AdminAccessDeniedError();
    return { role: "ADMIN" };
  } catch (error) {
    if (error instanceof AdminAccessDeniedError || error instanceof AdminAccessTechnicalError) throw error;
    console.error("Échec technique pendant la vérification de la session administrateur.");
    throw new AdminAccessTechnicalError();
  }
}
