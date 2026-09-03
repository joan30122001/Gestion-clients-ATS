"use server";

import { redirect } from "next/navigation";
import { clearLocalAdminSession } from "@/features/auth/infrastructure/local-admin-session";

export async function logoutAction() {
  await clearLocalAdminSession();
  redirect("/login");
}