import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(resolve("supabase/migrations/20260903120000_create_packages.sql"), "utf8").toLowerCase();

describe("migration packages", () => {
  it("active RLS et limite sélection, création et modification aux ADMIN actifs", () => {
    expect(sql).toContain("enable row level security");
    expect(sql.match(/create policy/g)).toHaveLength(3);
    expect(sql).toMatch(/for select to authenticated\s+using \(exists/);
    expect(sql).toMatch(/for insert to authenticated\s+with check \(exists/);
    expect(sql).toMatch(/for update to authenticated\s+using \(exists[\s\S]+with check \(exists/);
    expect(sql).toContain("profiles.role = 'admin'");
    expect(sql).toContain("profiles.is_active = true");
    expect(sql).not.toMatch(/for delete/);
    expect(sql).not.toMatch(/policy[^;]+to (public|anon)/);
    expect(sql).toContain("revoke all on function public.list_packages_admin() from public, anon");
  });

  it("contraint le contenu, le prix positif, l’ordre et l’horodatage", () => {
    expect(sql).toContain("monthly_price bigint not null check (monthly_price > 0)");
    expect(sql).toContain("char_length(btrim(name)) > 0");
    expect(sql).toContain("packages_stable_order_idx");
    expect(sql).toContain("packages_set_updated_at");
  });
});
