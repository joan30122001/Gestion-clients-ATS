import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
vi.mock("@/features/packages/application/package-actions", () => ({ updatePackageAction: vi.fn() }));
import { PackagesList } from "./packages-list";

const records = [
  { id: "11111111-1111-4111-8111-111111111111", name: "Actif Plus", description: "Offre active", monthlyPrice: "25000", isActive: true, createdAt: "2026-01-02", updatedAt: "2026-01-02" },
  { id: "22222222-2222-4222-8222-222222222222", name: "Archive", description: "Offre historique", monthlyPrice: "10000", isActive: false, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
];

describe("PackagesList", () => {
  it("rend un état vide explicite", () => {
    render(<PackagesList packages={[]} />);
    expect(screen.getByText(/aucun forfait/i)).toBeVisible();
  });

  it("conserve actifs et inactifs avec prix et statut textuel", () => {
    render(<PackagesList packages={records} />);
    expect(screen.getByText("Actif Plus")).toBeVisible();
    expect(screen.getByText("Archive")).toBeVisible();
    expect(screen.getByText("Inactif")).toBeVisible();
    expect(screen.getByText(/25.*000 FCFA/)).toBeVisible();
  });

  it("ouvre l’édition préremplie et permet de l’annuler au clavier", () => {
    render(<PackagesList packages={records} />);
    fireEvent.click(screen.getAllByRole("button", { name: "Modifier" })[1]);
    expect(screen.getByLabelText("Nom")).toHaveValue("Archive");
    expect(screen.getByRole("radio", { name: "Inactif" })).toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: "Annuler" }));
    expect(screen.queryByRole("button", { name: /enregistrer les modifications/i })).not.toBeInTheDocument();
  });
});
