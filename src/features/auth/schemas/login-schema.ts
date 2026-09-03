import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "L’adresse e-mail est requise.").email("Saisissez une adresse e-mail valide."),
  password: z.string().min(1, "Le mot de passe est requis."),
});

export type LoginInput = z.infer<typeof loginSchema>;
