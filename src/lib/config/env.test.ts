import { describe, expect, it } from "vitest";
import { getPublicEnv } from "./env";

describe("getPublicEnv", () => {
  it("rejette une configuration absente sans divulguer les valeurs", () => {
    expect(() => getPublicEnv({})).toThrow("Configuration Supabase publique absente ou invalide.");
  });

  it("accepte uniquement la configuration publique attendue", () => {
    expect(getPublicEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "public-key",
      SUPABASE_SERVICE_ROLE_KEY: "secret-never-returned",
    })).toEqual({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "public-key",
    });
  });

  it.each([
    "pas-une-url",
    "ftp://example.supabase.co",
    "http://example.supabase.co",
  ])("rejette l’URL Supabase invalide %s", (url) => {
    expect(() => getPublicEnv({
      NEXT_PUBLIC_SUPABASE_URL: url,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "public-key",
    })).toThrow("Configuration Supabase publique absente ou invalide.");
  });

  it.each(["http://localhost:54321", "http://127.0.0.1:54321", "https://example.supabase.co"])(
    "accepte l’URL Supabase autorisée %s",
    (url) => expect(getPublicEnv({
      NEXT_PUBLIC_SUPABASE_URL: url,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: " public-key ",
    })).toEqual({
      NEXT_PUBLIC_SUPABASE_URL: url,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "public-key",
    }),
  );

  it("rejette une clé composée uniquement d’espaces", () => {
    expect(() => getPublicEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "   ",
    })).toThrow("Configuration Supabase publique absente ou invalide.");
  });
});
