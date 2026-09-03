import { expect, test } from "@playwright/test";

test.describe("administration des forfaits", () => {
  test("un visiteur ne voit aucune donnée et retourne à la connexion", async ({ page }) => {
    await page.goto("/forfaits");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Forfaits" })).toHaveCount(0);
  });

  for (const viewport of [{ width: 375, height: 800 }, { width: 768, height: 900 }, { width: 1440, height: 900 }]) {
    test(`la route reste protégée à ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/forfaits");
      await expect(page).toHaveURL(/\/login$/);
    });
  }
});
