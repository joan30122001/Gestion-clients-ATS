import type { LoginInput } from "@/features/auth/schemas/login-schema";

export type LoginFieldErrors = Partial<Record<keyof LoginInput, string[]>>;

type LoginStateBase = {
  ok: false;
  revision: number;
};

export type LoginState =
  | (LoginStateBase & { code: "IDLE" })
  | (LoginStateBase & { code: "VALIDATION_ERROR"; fieldErrors: LoginFieldErrors; values: { email: string } })
  | (LoginStateBase & { code: "AUTHORIZATION_FAILED"; message: string; values: { email: string } });

export const initialLoginState: LoginState = { ok: false, code: "IDLE", revision: 0 };
