"use server";

import { redirect } from "next/navigation";
import { loginSchema } from "@/features/auth/schemas/login-schema";
import type { LoginState } from "@/features/auth/application/login-state";
import { createLocalAdminSession } from "@/features/auth/infrastructure/local-admin-session";

const deniedMessage = "E-mail ou mot de passe incorrect, ou accès non autorisé.";

function denied(email: string, revision: number): LoginState {
  return {
    ok: false,
    revision,
    code: "AUTHORIZATION_FAILED",
    message: deniedMessage,
    values: { email },
  };
}

export async function loginAction(previousState: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  const submittedEmail = String(formData.get("email") ?? "").trim();

  if (!parsed.success) {
    return {
      ok: false,
      revision: previousState.revision + 1,
      code: "VALIDATION_ERROR",
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: { email: submittedEmail },
    };
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const emailMatches = parsed.data.email.toLowerCase() === adminEmail;
  const passwordMatches = parsed.data.password === adminPassword;

  if (!adminEmail || !adminPassword || !emailMatches || !passwordMatches) {
    return denied(parsed.data.email, previousState.revision + 1);
  }

  await createLocalAdminSession();
  redirect("/dashboard");
}
