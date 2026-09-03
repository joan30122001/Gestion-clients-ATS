import type { SupabaseClient } from "@supabase/supabase-js";

export type AdminProfileCheck = {
  authorized: boolean;
  failed: boolean;
};

export async function getAdminProfile(
  client: SupabaseClient,
  userId: string,
): Promise<AdminProfileCheck> {
  const { data, error } = await client
    .from("profiles")
    .select("role,is_active")
    .eq("id", userId)
    .maybeSingle();

  if (error) return { authorized: false, failed: true };
  return {
    authorized: data?.role === "ADMIN" && data.is_active === true,
    failed: false,
  };
}

