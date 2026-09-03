"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LoginInput } from "@/features/auth/schemas/login-schema";
import { loginAction } from "@/features/auth/application/login-action";
import { initialLoginState } from "@/features/auth/application/login-state";

type FieldErrors = Partial<Record<keyof LoginInput, string>>;

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialLoginState);
  const [dismissedErrors, setDismissedErrors] = useState<{ revision: number; fields: FieldErrors }>({ revision: -1, fields: {} });
  const [dismissedMessageRevision, setDismissedMessageRevision] = useState(-1);
  const [showPassword, setShowPassword] = useState(false);
  const focusFrame = useRef<number | null>(null);
  const fieldErrors = state.code === "VALIDATION_ERROR" ? state.fieldErrors : undefined;
  const submittedEmail = state.code === "IDLE" ? "" : state.values.email;

  const errors: FieldErrors = {
    email: dismissedErrors.revision === state.revision && dismissedErrors.fields.email ? undefined : fieldErrors?.email?.[0],
    password: dismissedErrors.revision === state.revision && dismissedErrors.fields.password ? undefined : fieldErrors?.password?.[0],
  };

  useEffect(() => () => {
    if (focusFrame.current !== null) cancelAnimationFrame(focusFrame.current);
  }, []);

  useEffect(() => {
    const firstInvalid = (["email", "password"] as const).find((field) => fieldErrors?.[field]?.[0]);
    if (firstInvalid) {
      if (focusFrame.current !== null) cancelAnimationFrame(focusFrame.current);
      focusFrame.current = requestAnimationFrame(() => {
        document.getElementById(firstInvalid)?.focus();
        focusFrame.current = null;
      });
    }
  }, [state, fieldErrors]);

  function clearFieldError(field: keyof LoginInput) {
    setDismissedMessageRevision(state.revision);
    setDismissedErrors((current) => ({
      revision: state.revision,
      fields: current.revision === state.revision
        ? { ...current.fields, [field]: "dismissed" }
        : { [field]: "dismissed" },
    }));
  }

  return (
    <form className="space-y-5" action={formAction} noValidate aria-busy={pending}>
      <div className="space-y-2">
        <Label htmlFor="email">Adresse e-mail</Label>
        <div className="relative">
          <Mail aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
          <Input key={`email-${state.revision}`} id="email" name="email" type="email" autoComplete="email" inputMode="email" placeholder="admin@entreprise.com" className="pl-10" defaultValue={submittedEmail} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} onChange={() => clearFieldError("email")} />
        </div>
        {errors.email && <p id="email-error" className="text-sm text-destructive" role="alert">{errors.email}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <div className="relative">
          <LockKeyhole aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
          <Input key={`password-${state.revision}`} id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Votre mot de passe" className="pl-10 pr-11" defaultValue="" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "password-error" : undefined} onChange={() => clearFieldError("password")} />
          <button type="button" aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"} title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"} onClick={() => setShowPassword((visible) => !visible)} className="absolute right-2 top-2 rounded-md p-1.5 text-muted-foreground hover:bg-slate-100 hover:text-foreground">{showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}</button>
        </div>
        {errors.password && <p id="password-error" className="text-sm text-destructive" role="alert">{errors.password}</p>}
      </div>
      {state.code === "AUTHORIZATION_FAILED" && dismissedMessageRevision !== state.revision && <p className="text-sm text-destructive" role="alert">{state.message}</p>}
      <Button type="submit" disabled={pending}>{pending ? "Connexion…" : "Connexion"}</Button>
    </form>
  );
}
