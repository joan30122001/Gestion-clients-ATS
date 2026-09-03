import type { PackageValues } from "@/features/packages/schemas/package-schema";

export type PackageRecord = {
  id: string;
  name: string;
  description: string;
  monthlyPrice: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PackageField = "id" | "name" | "description" | "monthlyPrice" | "isActive";
export type PackageActionState =
  | { ok: false; code: "IDLE"; revision: number }
  | { ok: false; code: "VALIDATION_ERROR"; revision: number; fieldErrors: Partial<Record<PackageField, string[]>>; values: PackageValues }
  | { ok: false; code: "ACCESS_DENIED" | "TECHNICAL_ERROR" | "NOT_FOUND"; revision: number; message: string; values: PackageValues }
  | { ok: true; data: { message: string }; revision: number };

export const initialPackageState: PackageActionState = { ok: false, code: "IDLE", revision: 0 };
