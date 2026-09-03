import "server-only";

import { requireActiveAdmin } from "@/features/auth/application/require-active-admin";
import { PackagesRepository } from "@/features/packages/infrastructure/packages-repository";

export async function listPackages() {
  await requireActiveAdmin();
  return new PackagesRepository().list();
}

export async function listActivePackages() {
  await requireActiveAdmin();
  return new PackagesRepository().listActive();
}
