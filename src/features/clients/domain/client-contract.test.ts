import { describe, expect, it } from "vitest";
import { calculateContractTotal, isCustomContractTotal } from "./client-contract";

describe("contrat client", () => {
  it("calcule exactement durée × mensualité avec BigInt", () => expect(calculateContractTotal("12", "9007199254740993")).toBe("108086391056891916"));
  it("détecte un montant personnalisé", () => expect(isCustomContractTotal("3", "10000", "25000")).toBe(true));
});
