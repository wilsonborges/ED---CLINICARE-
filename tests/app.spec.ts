import { test, expect } from "@playwright/test";
test("navegação, busca, favoritos e modo Estudo persistem sem dados clínicos", async ({
  page,
}) => {
  await page.goto("./");
  await expect(
    page.getByRole("heading", { name: "Seu conhecimento. Sempre à mão." }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Pesquisar ferramentas" })
    .fill("pressao arterial");
  await expect(
    page.getByRole("heading", { name: "Pressão arterial média" }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Adicionar Pressão arterial média aos favoritos",
    })
    .click();
  await page
    .getByRole("button", { name: /Pressão arterial média Estimativa/ })
    .click();
  await page.getByLabel("Pressão sistólica").fill("120");
  await page.getByLabel("Pressão diastólica").fill("80");
  await page.getByRole("button", { name: "Calcular resultado" }).click();
  await expect(page.getByRole("heading", { name: "93,33 mmHg" })).toBeVisible();
  await page.getByLabel("Pressão sistólica").fill("130");
  await expect(page.getByRole("heading", { name: "93,33 mmHg" })).toHaveCount(
    0,
  );
  await page.getByRole("button", { name: "Estudo", exact: true }).click();
  await expect(page.locator("details")).toHaveAttribute("open", "");
  const stored = await page.evaluate(() => JSON.stringify(localStorage));
  expect(stored).toContain("pam");
  expect(stored).not.toContain("130");
  expect(stored).not.toContain("120");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Estudo", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});
test("gasometria exemplo e invalidação do resultado", async ({ page }) => {
  await page.goto("./#gas");
  await page
    .getByRole("button", { name: /Carregar exemplo educacional/ })
    .click();
  await page.getByRole("button", { name: "Analisar gasometria" }).click();
  await expect(
    page.getByRole("heading", {
      name: /Acidemia · Compatível com acidose metabólica/,
    }),
  ).toBeVisible();
  await expect(page.getByText(/27–31 mmHg/)).toBeVisible();
  await page.getByLabel("pH", { exact: false }).first().fill("");
  await page.getByRole("button", { name: "Analisar gasometria" }).click();
  await expect(page.getByRole("alert")).toContainText("Informe pH");
});
test("exames só com intervalo confirmado, limites inclusivos e limpeza", async ({
  page,
}) => {
  await page.goto("./#electrolytes");
  await page.getByRole("textbox", { name: /^Idade/ }).fill("40");
  await page
    .getByLabel("Contexto do intervalo por sexo")
    .selectOption("female");
  await page.getByLabel("Amostra do laudo").selectOption("serum");
  await page.getByLabel("Potássio — resultado").fill("5");
  await page.getByLabel("Potássio — limite inferior").fill("3,5");
  await page.getByLabel("Potássio — limite superior").fill("5");
  await page.getByRole("button", { name: "Comparar com o laudo" }).click();
  await expect(page.getByRole("alert")).toContainText("confirme");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Comparar com o laudo" }).click();
  await expect(page.getByText("No intervalo", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Limpar tudo" }).click();
  await expect(page.getByLabel("Potássio — resultado")).toHaveValue("");
  await expect(
    page.getByRole("heading", { name: "Comparação individual" }),
  ).toHaveCount(0);
});
test("layout responsivo e navegação por teclado", async ({ page }) => {
  await page.goto("./");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Pular para conteúdo" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  if (await page.getByRole("button", { name: "Abrir navegação" }).isVisible()) {
    await page.getByRole("button", { name: "Abrir navegação" }).click();
    await page.getByRole("link", { name: "Configurações" }).click();
    await expect(
      page.getByRole("heading", { name: "Configurações", exact: true }),
    ).toBeVisible();
  }
});
test("PWA armazena shell e calcula após recarga offline", async ({
  page,
  context,
}) => {
  await page.goto("./");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await expect
    .poll(() => page.evaluate(async () => !!navigator.serviceWorker.controller))
    .toBeTruthy();
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Seu conhecimento. Sempre à mão." }),
  ).toBeVisible();
  await page.goto("./#pam");
  await page.getByLabel("Pressão sistólica").fill("120");
  await page.getByLabel("Pressão diastólica").fill("80");
  await page.getByRole("button", { name: "Calcular resultado" }).click();
  await expect(page.getByRole("heading", { name: "93,33 mmHg" })).toBeVisible();
  await expect(page.getByText("Você está offline")).toBeVisible();
});
