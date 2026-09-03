import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ requireActiveAdmin: vi.fn(), list: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/features/auth/application/require-active-admin", () => ({ requireActiveAdmin: mocks.requireActiveAdmin }));
vi.mock("@/features/packages/infrastructure/packages-repository", () => ({ PackagesRepository: class { list = mocks.list; } }));
import { listPackages } from "./list-packages";

beforeEach(() => vi.clearAllMocks());

it("applique la garde avant de déléguer la lecture au dépôt", async () => {
  const client = {};
  mocks.requireActiveAdmin.mockResolvedValue({ client });
  mocks.list.mockResolvedValue([{ id: "p" }]);
  await expect(listPackages()).resolves.toEqual([{ id: "p" }]);
  expect(mocks.requireActiveAdmin).toHaveBeenCalledBefore(mocks.list);
});

it("ne lit rien lorsque la garde refuse", async () => {
  mocks.requireActiveAdmin.mockRejectedValue(new Error("denied"));
  await expect(listPackages()).rejects.toThrow("denied");
  expect(mocks.list).not.toHaveBeenCalled();
});
