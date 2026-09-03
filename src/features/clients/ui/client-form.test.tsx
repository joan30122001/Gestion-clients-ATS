import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
vi.mock("@/features/clients/application/client-actions", () => ({ createClientAction: vi.fn() }));
import { ClientForm } from "./client-form";

const packages = [{ id: "00000000-0000-4000-8000-000000000001", name: "Essentiel", description: "Offre", monthlyPrice: "10000", isActive: true, createdAt: "2026-09-03", updatedAt: "2026-09-03" }];

describe("ClientForm", () => {
  it("propose le total calculé puis signale clairement une valeur personnalisée", () => {
    render(<ClientForm packages={packages} />);
    expect(screen.getByLabelText("Mensualité (FCFA)")).toHaveValue("10000");
    fireEvent.change(screen.getByLabelText("Durée (mois)"), { target: { value: "3" } });
    expect(screen.getByLabelText("Montant contractuel total (FCFA)")).toHaveValue("30000");
    fireEvent.change(screen.getByLabelText("Montant contractuel total (FCFA)"), { target: { value: "25000" } });
    expect(screen.getByRole("status")).toHaveTextContent("Montant personnalisé");
  });
});
