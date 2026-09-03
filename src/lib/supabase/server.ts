import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getPublicEnv } from "@/lib/config/env";

function isReadOnlyCookieStoreError(error: unknown): boolean {
  return error instanceof Error && /cookies can only be modified in a server action or route handler/i.test(error.message);
}

export async function createClient() {
  const env = getPublicEnv();
  const cookieStore = await cookies();
  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch (error) {
          // La lecture reste valide dans un Server Component, où Next interdit
          // explicitement l’écriture. Toute autre erreur signale un vrai défaut.
          if (!isReadOnlyCookieStoreError(error)) throw error;
        }
      },
    },
  });
}

export async function clearSupabaseAuthCookies() {
  const cookieStore = await cookies();
  const authCookie = /^sb-[a-z0-9-]+-auth-token(?:\.\d+)?$/i;
  cookieStore.getAll().forEach(({ name }) => {
    if (authCookie.test(name)) cookieStore.set(name, "", { path: "/", maxAge: 0 });
  });
}
