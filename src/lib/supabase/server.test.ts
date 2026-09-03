import { afterEach, describe, expect, it, vi } from "vitest";

const { cookiesMock, createServerClientMock } = vi.hoisted(() => ({
  cookiesMock: vi.fn(),
  createServerClientMock: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: cookiesMock }));
vi.mock("@supabase/ssr", () => ({ createServerClient: createServerClientMock }));

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

async function configuredFactory() {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "public-key");
  const { createClient } = await import("./server");
  return createClient();
}

describe("createClient serveur", () => {
  it("échoue explicitement sans configuration et ne divulgue aucun secret", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    const { createClient } = await import("./server");
    await expect(createClient()).rejects.toThrow("Configuration Supabase publique absente ou invalide.");
  });

  it("transmet la configuration, getAll et les options de setAll", async () => {
    const cookieStore = { getAll: vi.fn(() => [{ name: "session", value: "abc" }]), set: vi.fn() };
    cookiesMock.mockResolvedValue(cookieStore);
    const client = { kind: "server-client" };
    createServerClientMock.mockReturnValue(client);

    await expect(configuredFactory()).resolves.toBe(client);
    const [, , options] = createServerClientMock.mock.calls[0];
    expect(options.cookies.getAll()).toEqual([{ name: "session", value: "abc" }]);
    const cookieOptions = { httpOnly: true, sameSite: "lax" as const, path: "/" };
    options.cookies.setAll([{ name: "session", value: "next", options: cookieOptions }]);
    expect(cookieStore.set).toHaveBeenCalledWith("session", "next", cookieOptions);
  });

  it("tolère uniquement l’erreur Next de cookies en lecture seule", async () => {
    const cookieStore = {
      getAll: vi.fn(() => []),
      set: vi.fn(() => { throw new Error("Cookies can only be modified in a Server Action or Route Handler."); }),
    };
    cookiesMock.mockResolvedValue(cookieStore);
    createServerClientMock.mockReturnValue({});
    await configuredFactory();
    const [, , options] = createServerClientMock.mock.calls[0];
    expect(() => options.cookies.setAll([{ name: "session", value: "next", options: {} }])).not.toThrow();
  });

  it("relance une erreur inattendue d’écriture de cookie", async () => {
    const cookieStore = { getAll: vi.fn(() => []), set: vi.fn(() => { throw new Error("disque indisponible"); }) };
    cookiesMock.mockResolvedValue(cookieStore);
    createServerClientMock.mockReturnValue({});
    await configuredFactory();
    const [, , options] = createServerClientMock.mock.calls[0];
    expect(() => options.cookies.setAll([{ name: "session", value: "next", options: {} }])).toThrow("disque indisponible");
  });
});

describe("clearSupabaseAuthCookies", () => {
  it("expire uniquement les cookies de session Supabase", async () => {
    const cookieStore = {
      getAll: vi.fn(() => [
        { name: "sb-project-auth-token", value: "token" },
        { name: "sb-project-auth-token.0", value: "chunk" },
        { name: "preferences", value: "compact" },
      ]),
      set: vi.fn(),
    };
    cookiesMock.mockResolvedValue(cookieStore);
    const { clearSupabaseAuthCookies } = await import("./server");

    await clearSupabaseAuthCookies();
    expect(cookieStore.set).toHaveBeenCalledTimes(2);
    expect(cookieStore.set).toHaveBeenCalledWith("sb-project-auth-token", "", { path: "/", maxAge: 0 });
    expect(cookieStore.set).not.toHaveBeenCalledWith("preferences", expect.anything(), expect.anything());
  });
});
