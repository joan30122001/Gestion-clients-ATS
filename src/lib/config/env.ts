import { z } from "zod";

const supabaseUrlSchema = z.string().trim().url().superRefine((value, context) => {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return;
  }
  const isLocalHttp = url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname);
  if (url.protocol !== "https:" && !isLocalHttp) {
    context.addIssue({ code: "custom", message: "L’URL Supabase doit utiliser HTTPS, sauf en local." });
  }
});

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: supabaseUrlSchema,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().trim().min(1),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

export function getPublicEnv(source?: Record<string, string | undefined>): PublicEnv {
  // Ces références doivent rester statiques pour que Next.js puisse les injecter
  // dans le bundle client. Une lecture dynamique via process.env[key] ne le permet pas.
  const candidate = source ?? {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
  const result = publicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: candidate.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: candidate.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
  if (!result.success) throw new Error("Configuration Supabase publique absente ou invalide.");
  return result.data;
}
