import { describe, expect, it } from "vitest";
import { clientSchema, normalizeCameroonPhone } from "./client-schema";

const valid = { name: "Awa N.", phone: "6 99-00 00 00", location: "Douala", subscriptionDate: "2026-09-03", packageId: "00000000-0000-4000-8000-000000000001", durationMonths: "3", monthlyAmount: "10000", totalAmount: "30000", notes: "" };

describe("clientSchema", () => {
  it.each([["699000000", "+237699000000"], ["+237 699-000-000", "+237699000000"], ["00237 233 00 00 00", "+237233000000"]])("normalise un téléphone camerounais", (input, expected) => expect(normalizeCameroonPhone(input)).toBe(expected));
  it.each(["", "123456789", "+237799000000", "69900"])("refuse le téléphone %s", (phone) => expect(clientSchema.safeParse({ ...valid, phone }).success).toBe(false));
  it("refuse une date calendaire impossible", () => expect(clientSchema.safeParse({ ...valid, subscriptionDate: "2026-02-31" }).success).toBe(false));
  it("refuse date, durée et montants invalides sans produire de client", () => expect(clientSchema.safeParse({ ...valid, subscriptionDate: "03/09/2026", durationMonths: "0", totalAmount: "1.5" }).success).toBe(false));
});
