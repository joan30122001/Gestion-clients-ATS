import { expect, it } from "vitest";
import { formatFcfa } from "./format-fcfa";

it("formate sans décimale et sans perdre les grands entiers", () => {
  expect(formatFcfa("9223372036854775807")).toMatch(/^9[\s\u202f]223[\s\u202f]372[\s\u202f]036[\s\u202f]854[\s\u202f]775[\s\u202f]807 FCFA$/);
});

it("formate aussi un bigint natif et rejette une chaîne non entière", () => {
  expect(formatFcfa(BigInt("15000"))).toMatch(/15[\s\u202f]000 FCFA/);
  expect(() => formatFcfa("1.5")).toThrow();
});
