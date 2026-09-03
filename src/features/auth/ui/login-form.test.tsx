import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "./login-form";

const loginActionMock = vi.hoisted(() => vi.fn());
vi.mock("@/features/auth/application/login-action", () => ({ loginAction: loginActionMock }));

beforeEach(() => vi.clearAllMocks());

describe("LoginForm", () => {
  it("affiche des contrôles accessibles", () => {
    render(<LoginForm />);
    expect(screen.getByRole("textbox", { name: "Adresse e-mail" })).toBeVisible();
    expect(screen.getByLabelText("Mot de passe")).toBeVisible();
    expect(screen.getByRole("button", { name: "Connexion" })).toBeVisible();
  });

  it("affiche les erreurs serveur, conserve l’e-mail, vide le mot de passe et focalise le premier champ", async () => {
    loginActionMock.mockResolvedValue({
      ok: false,
      revision: 1,
      code: "VALIDATION_ERROR",
      fieldErrors: { email: ["Saisissez une adresse e-mail valide."], password: ["Le mot de passe est requis."] },
      values: { email: "adresse-invalide" },
    });
    render(<LoginForm />);
    const email = screen.getByLabelText("Adresse e-mail");
    const password = screen.getByLabelText("Mot de passe");
    fireEvent.change(email, { target: { value: "adresse-invalide" } });
    fireEvent.change(password, { target: { value: "secret" } });
    fireEvent.submit(email.closest("form")!);

    expect(await screen.findByText("Saisissez une adresse e-mail valide.")).toBeVisible();
    expect(screen.getByLabelText("Adresse e-mail")).toHaveValue("adresse-invalide");
    expect(screen.getByLabelText("Mot de passe")).toHaveValue("");
    await waitFor(() => expect(screen.getByLabelText("Adresse e-mail")).toHaveFocus());
  });

  it("affiche l’erreur générique dans une alerte sans conserver le mot de passe", async () => {
    loginActionMock.mockResolvedValue({
      ok: false,
      revision: 1,
      code: "AUTHORIZATION_FAILED",
      message: "E-mail ou mot de passe incorrect, ou accès non autorisé.",
      values: { email: "admin@example.com" },
    });
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText("Adresse e-mail"), { target: { value: "admin@example.com" } });
    fireEvent.change(screen.getByLabelText("Mot de passe"), { target: { value: "secret" } });
    fireEvent.submit(screen.getByRole("button", { name: "Connexion" }).closest("form")!);

    expect(await screen.findByRole("alert")).toHaveTextContent("E-mail ou mot de passe incorrect, ou accès non autorisé.");
    expect(screen.getByLabelText("Adresse e-mail")).toHaveValue("admin@example.com");
    expect(screen.getByLabelText("Mot de passe")).toHaveValue("");

    fireEvent.change(screen.getByLabelText("Adresse e-mail"), { target: { value: "autre@example.com" } });
    expect(screen.queryByText("E-mail ou mot de passe incorrect, ou accès non autorisé.")).not.toBeInTheDocument();
  });
});
