import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PackageForm } from "./package-form";
import type { PackageActionState } from "../application/package-state";

describe("PackageForm", () => {
  it("affiche le succès après création", async () => {
    const action = vi.fn(async (): Promise<PackageActionState> => ({ ok: true, revision: 1, data: { message: "Forfait créé avec succès." } }));
    render(<PackageForm action={action} />);
    fireEvent.click(screen.getByRole("button", { name: /créer/i }));
    expect(await screen.findByRole("status")).toHaveTextContent("Forfait créé avec succès.");
  });

  it("affiche les erreurs françaises et focalise le premier champ invalide", async () => {
    const action = vi.fn(async (): Promise<PackageActionState> => ({ ok: false, code: "VALIDATION_ERROR", revision: 1, values: { name: "", description: "", monthlyPrice: "0", isActive: "true" }, fieldErrors: { name: ["Le nom est requis."], monthlyPrice: ["Le prix doit être un nombre entier strictement positif."] } }));
    render(<PackageForm action={action} />);
    fireEvent.click(screen.getByRole("button", { name: /créer/i }));
    expect(await screen.findByText("Le nom est requis.")).toBeVisible();
    await waitFor(() => expect(screen.getByLabelText("Nom")).toHaveFocus());
  });

  it("présente une erreur technique générique sans détail interne", async () => {
    const action = vi.fn(async (): Promise<PackageActionState> => ({ ok: false, code: "TECHNICAL_ERROR", revision: 1, message: "L’opération n’a pas pu aboutir. Veuillez réessayer.", values: { name: "A", description: "B", monthlyPrice: "1", isActive: "true" } }));
    render(<PackageForm action={action} />);
    fireEvent.click(screen.getByRole("button", { name: /créer/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Veuillez réessayer");
  });

  it("désactive la soumission pendant l’action et empêche une double soumission", async () => {
    let resolve!: (value: PackageActionState) => void;
    const action = vi.fn(() => new Promise<PackageActionState>((done) => { resolve = done; }));
    render(<PackageForm action={action} />);
    const button = screen.getByRole("button", { name: /créer/i });
    fireEvent.click(button);
    await waitFor(() => expect(button).toBeDisabled());
    fireEvent.click(button);
    expect(action).toHaveBeenCalledTimes(1);
    resolve({ ok: true, revision: 1, data: { message: "Créé" } });
  });

  it("masque une erreur obsolète dès que le champ est corrigé", async () => {
    const action = vi.fn(async (): Promise<PackageActionState> => ({ ok: false, code: "VALIDATION_ERROR", revision: 1, values: { name: "", description: "D", monthlyPrice: "1", isActive: "true" }, fieldErrors: { name: ["Le nom est requis."] } }));
    render(<PackageForm action={action} />);
    fireEvent.click(screen.getByRole("button", { name: /créer/i }));
    expect(await screen.findByText("Le nom est requis.")).toBeVisible();
    fireEvent.change(screen.getByLabelText("Nom"), { target: { value: "Corrigé" } });
    expect(screen.queryByText("Le nom est requis.")).not.toBeInTheDocument();
  });
});
