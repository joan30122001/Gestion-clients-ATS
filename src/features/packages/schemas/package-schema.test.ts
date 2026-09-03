import { describe, expect, it } from "vitest";
import { createPackageSchema } from "./package-schema";

const valid = { name: "Essentiel", description: "Connexion mensuelle", monthlyPrice: "15000", isActive: "true" };

describe("createPackageSchema", () => {
  it("accepte un prix FCFA entier positif transporté comme chaîne", () => {
    expect(createPackageSchema.parse(valid)).toEqual({ ...valid, isActive: true });
  });

  it.each(["", "0", "-1", "+2", "1.5", "abc", "9223372036854775808"])("refuse le prix invalide %s", (monthlyPrice) => {
    expect(createPackageSchema.safeParse({ ...valid, monthlyPrice }).success).toBe(false);
  });

  it("refuse les contenus vides", () => {
    const result = createPackageSchema.safeParse({ ...valid, name: " ", description: "" });
    expect(result.success).toBe(false);
  });
});
