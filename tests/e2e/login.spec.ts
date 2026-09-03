import { expect, test } from "@playwright/test";

const viewports = [
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];

test("la racine redirige vers la page de connexion", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
});

for (const viewport of viewports) {
  test(`la page reste accessible et sans débordement à ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/login");
    await expect(page.getByLabel("Adresse e-mail")).toBeVisible();
    await expect(page.getByLabel("Mot de passe")).toBeVisible();
    await expect(page.getByRole("button", { name: "Connexion" })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
  });
}

test("un formulaire incomplet affiche les erreurs et ne déclenche aucune authentification", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("supabase")) requests.push(request.url());
  });
  await page.goto("/login");
  await page.getByRole("button", { name: "Connexion" }).click();
  await expect(page.getByText("L’adresse e-mail est requise.")).toBeVisible();
  await expect(page.getByText("Le mot de passe est requis.")).toBeVisible();
  await expect(page.getByLabel("Adresse e-mail")).toBeFocused();
  expect(requests).toEqual([]);
});

test("un refus conserve l’e-mail, vide le mot de passe et n’expose aucun détail", async ({ page, context }) => {
  await page.goto("/login");
  await page.getByLabel("Adresse e-mail").fill("admin@example.com");
  await page.getByLabel("Mot de passe").fill("secret");
  const requestsAfterSubmit: Array<{ method: string; url: string }> = [];
  page.on("request", (request) => requestsAfterSubmit.push({ method: request.method(), url: request.url() }));
  await page.getByRole("button", { name: "Connexion" }).click();
  await expect(page.getByText("E-mail ou mot de passe incorrect, ou accès non autorisé.", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByLabel("Adresse e-mail")).toHaveValue("admin@example.com");
  await expect(page.getByLabel("Mot de passe")).toHaveValue("");
  const posts = requestsAfterSubmit.filter((request) => request.method === "POST");
  expect(posts).toHaveLength(1);
  expect(new URL(posts[0].url).pathname).toBe("/login");
  const applicationOrigin = new URL(page.url()).origin;
  expect(requestsAfterSubmit.filter((request) => new URL(request.url).origin !== applicationOrigin)).toEqual([]);
  expect(await context.cookies()).toEqual([]);
});

test("le formulaire est utilisable au clavier avec un focus visible", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/login");

  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Adresse e-mail")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Mot de passe")).toBeFocused();
  await page.keyboard.press("Tab");
  const submit = page.getByRole("button", { name: "Connexion" });
  await expect(submit).toBeFocused();
  const focusIsVisible = await submit.evaluate((element) => {
    const style = getComputedStyle(element);
    return style.outlineStyle !== "none" || style.boxShadow !== "none";
  });
  expect(focusIsVisible).toBe(true);

  const bounds = await submit.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(812);
  await page.keyboard.press("Enter");
  await expect(page.getByText("L’adresse e-mail est requise.")).toBeVisible();
});
