import type { ClientValues } from "@/features/clients/schemas/client-schema";

export type ClientField = keyof ClientValues;
export type ClientActionState =
  | { ok: false; code: "IDLE"; revision: number }
  | { ok: false; code: "VALIDATION_ERROR"; revision: number; fieldErrors: Partial<Record<ClientField, string[]>>; values: ClientValues }
  | { ok: false; code: "PACKAGE_UNAVAILABLE" | "TECHNICAL_ERROR"; revision: number; message: string; values: ClientValues }
  | { ok: true; revision: number; data: { message: string; clientCode: string; customTotal: boolean } };
export const initialClientState: ClientActionState = { ok: false, code: "IDLE", revision: 0 };
