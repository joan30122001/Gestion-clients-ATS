import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(process.cwd(), "supabase/migrations/20260902191000_create_profiles.sql"),
  "utf8",
);

describe("migration profiles", () => {
  it("lie chaque profil à auth.users et réserve les trois rôles", () => {
    expect(migration).toMatch(/id uuid primary key references auth\.users\(id\) on delete cascade/i);
    expect(migration).toMatch(/role in \('ADMIN', 'AGENT', 'COMPTABLE'\)/);
    expect(migration).toMatch(/is_active boolean not null default true/i);
  });

  it("active RLS et limite la lecture authentifiée au profil courant", () => {
    expect(migration).toMatch(/alter table public\.profiles enable row level security/i);
    expect(migration).toMatch(/for select\s+to authenticated\s+using \(id = \(select auth\.uid\(\)\)\)/i);
    expect(migration).not.toMatch(/to anon/i);
  });
});

