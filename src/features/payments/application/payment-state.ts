import type { PaymentValues } from "@/features/payments/schemas/payment-schema";

export type PaymentField = keyof PaymentValues;
export type PaymentActionState =
  | { ok: false; code: "IDLE"; revision: number }
  | { ok: false; code: "VALIDATION_ERROR"; revision: number; fieldErrors: Partial<Record<PaymentField, string[]>>; values: PaymentValues }
  | { ok: false; code: "CLIENT_NOT_FOUND" | "AMOUNT_EXCEEDED" | "TECHNICAL_ERROR"; revision: number; message: string; values: PaymentValues }
  | { ok: true; revision: number; data: { message: string } };

export const initialPaymentState: PaymentActionState = { ok: false, code: "IDLE", revision: 0 };
