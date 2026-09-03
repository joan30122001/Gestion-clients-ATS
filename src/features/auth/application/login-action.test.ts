import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initialLoginState } from "./login-state";

const { clearSupabaseAuthCookiesMock, createClientMock, getAdminProfileMock, redirectMock } = vi.hoisted(() => ({
  clearSupabaseAuthCookiesMock: vi.fn(),
  createClientMock: vi.fn(),
  getAdminProfileMock: vi.fn(),
  redirectMock: vi.fn(() => { throw new Error("NEXT_REDIRECT"); }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
  clearSupabaseAuthCookies: clearSupabaseAuthCookiesMock,
}));
vi.mock("@/features/auth/infrastructure/get-admin-profile", () => ({ getAdminProfile: getAdminProfileMock }));
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

function credentials(email = "admin@example.com", password = "secret") {
  const data = new FormData();
  data.set("email", email);
  data.set("password", password);
  return data;
}

function clientWithAuth(result: unknown) {
  return {
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue(result),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => vi.restoreAllMocks());

describe("loginAction", () => {
  it("retourne les erreurs serveur sans appeler Supabase", async () => {
    const { loginAction } = await import("./login-action");
    const result = await loginAction(initialLoginState, credentials("invalide", ""));

    expect(result.code).toBe("VALIDATION_ERROR");
    if (result.code !== "VALIDATION_ERROR") throw new Error("État de validation attendu");
    expect(result.fieldErrors?.email?.[0]).toBe("Saisissez une adresse e-mail valide.");
    expect(result.fieldErrors?.password?.[0]).toBe("Le mot de passe est requis.");
    expect(result.values).toEqual({ email: "invalide" });
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("refuse les identifiants sans révéler leur cause", async () => {
    const client = clientWithAuth({ data: { user: null }, error: { message: "bad password" } });
    createClientMock.mockResolvedValue(client);
    const { loginAction } = await import("./login-action");

    const result = await loginAction(initialLoginState, credentials());
    expect(result).toMatchObject({
      code: "AUTHORIZATION_FAILED",
      message: "E-mail ou mot de passe incorrect, ou accès non autorisé.",
      values: { email: "admin@example.com" },
    });
    expect(JSON.stringify(result)).not.toContain("secret");
  });

  it.each([
    ["profil absent", { authorized: false, failed: false }],
    ["profil inactif ou rôle interdit", { authorized: false, failed: false }],
    ["lecture profil en erreur", { authorized: false, failed: true }],
  ])("ferme la session et renvoie la même erreur pour %s", async (_label, profile) => {
    const client = clientWithAuth({ data: { user: { id: "user-1" }, session: { access_token: "token" } }, error: null });
    createClientMock.mockResolvedValue(client);
    getAdminProfileMock.mockResolvedValue(profile);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { loginAction } = await import("./login-action");

    const result = await loginAction(initialLoginState, credentials());
    expect(client.auth.signOut).toHaveBeenCalledWith({ scope: "local" });
    if (result.code !== "AUTHORIZATION_FAILED") throw new Error("Refus attendu");
    expect(result.message).toBe("E-mail ou mot de passe incorrect, ou accès non autorisé.");
  });

  it("conserve la session ADMIN active et redirige vers le dashboard", async () => {
    const client = clientWithAuth({ data: { user: { id: "user-1" }, session: { access_token: "token" } }, error: null });
    createClientMock.mockResolvedValue(client);
    getAdminProfileMock.mockResolvedValue({ authorized: true, failed: false });
    const { loginAction } = await import("./login-action");

    await expect(loginAction(initialLoginState, credentials())).rejects.toThrow("NEXT_REDIRECT");
    expect(getAdminProfileMock).toHaveBeenCalledWith(client, "user-1");
    expect(client.auth.signOut).not.toHaveBeenCalled();
    expect(redirectMock).toHaveBeenCalledWith("/dashboard");
  });

  it("traite un échec de nettoyage comme une erreur technique expurgée", async () => {
    const client = clientWithAuth({ data: { user: { id: "user-1" }, session: { access_token: "token" } }, error: null });
    client.auth.signOut.mockResolvedValue({ error: { message: "cookie-secret" } });
    createClientMock.mockResolvedValue(client);
    getAdminProfileMock.mockResolvedValue({ authorized: false, failed: false });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { loginAction } = await import("./login-action");

    const result = await loginAction(initialLoginState, credentials());
    expect(JSON.stringify(result)).not.toContain("cookie-secret");
    expect(clearSupabaseAuthCookiesMock).toHaveBeenCalledOnce();
    expect(errorSpy).toHaveBeenCalledWith("Échec technique pendant le nettoyage de la session.");
  });

  it("nettoie la session si la lecture du profil lève une exception", async () => {
    const client = clientWithAuth({ data: { user: { id: "user-1" }, session: { access_token: "token" } }, error: null });
    createClientMock.mockResolvedValue(client);
    getAdminProfileMock.mockRejectedValue(new Error("database-secret"));
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { loginAction } = await import("./login-action");

    const result = await loginAction(initialLoginState, credentials());
    expect(client.auth.signOut).toHaveBeenCalledWith({ scope: "local" });
    expect(result.code).toBe("AUTHORIZATION_FAILED");
  });

  it("nettoie une session retournée avec une erreur d’authentification", async () => {
    const client = clientWithAuth({
      data: { user: { id: "user-1" }, session: { access_token: "token" } },
      error: { code: "service_error" },
    });
    createClientMock.mockResolvedValue(client);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { loginAction } = await import("./login-action");

    await loginAction(initialLoginState, credentials());
    expect(client.auth.signOut).toHaveBeenCalledWith({ scope: "local" });
  });

  it("expurge une erreur technique de la réponse et du journal", async () => {
    createClientMock.mockRejectedValue(new Error("token-secret-xyz"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { loginAction } = await import("./login-action");

    const result = await loginAction(initialLoginState, credentials("owner@example.com", "mot-de-passe-secret"));
    expect(JSON.stringify(result)).not.toContain("mot-de-passe-secret");
    expect(JSON.stringify(result)).not.toContain("token-secret-xyz");
    expect(errorSpy).toHaveBeenCalledWith("Échec technique pendant la connexion administrateur.");
  });
});
