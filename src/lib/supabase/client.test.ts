import { afterEach, describe, expect, it, vi } from "vitest";

const createBrowserClientMock = vi.hoisted(() => vi.fn());
vi.mock("@supabase/ssr", () => ({ createBrowserClient: createBrowserClientMock }));

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("createClient navigateur", () => {
  it("lit les variables publiques statiques et crée le client navigateur", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "public-key");
    const browserClient = { kind: "browser-client" };
    createBrowserClientMock.mockReturnValue(browserClient);
    const { createClient } = await import("./client");

    expect(createClient()).toBe(browserClient);
    expect(createBrowserClientMock).toHaveBeenCalledWith("https://example.supabase.co", "public-key");
  });
});
