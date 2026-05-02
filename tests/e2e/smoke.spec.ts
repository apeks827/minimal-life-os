import { expect, test } from "@playwright/test";

test("home onboarding settings classify and health endpoint", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.getByText("LifeInbox").first()).toBeVisible();
  await expect(page.getByText(/Облако подсказок|Suggestion cloud/)).toBeVisible();
  await page.getByPlaceholder(/Напишите что угодно/).fill("купить молоко завтра");
  await page.getByRole("button", { name: "Разобрать и добавить в план" }).click();
  await expect(page.getByText("купить молоко завтра").first()).toBeVisible();
  await page.getByRole("button", { name: "RU" }).click();
  await expect(page.getByPlaceholder(/Write anything/)).toBeVisible();

  await page.goto("/onboarding");
  await page.getByPlaceholder(/Например|For example/).fill("Учить английский и держать финансы спокойно");
  await page.getByRole("button", { name: /Фокус|Focus/, exact: true }).click();
  await page.getByRole("button", { name: /Сохранить профиль|Save profile/ }).click();
  await expect(page.getByText(/Профиль сохранен|Profile saved/)).toBeVisible();

  await page.goto("/settings#advanced");
  await expect(page.getByText("Advanced Settings")).toBeVisible();
  await page.getByLabel(/Лимит задач на день|Daily task limit/).fill("3");
  await page.getByLabel("Test mode").check();
  await page.getByRole("button", { name: /Сохранить настройки|Save settings/ }).click();
  await expect(page.getByText(/Настройки сохранены|Settings saved/)).toBeVisible();

  const health = await request.get("/api/health");
  expect(health.ok()).toBe(true);
  expect(await health.json()).toMatchObject({ ok: true, dependencies: { app: "ok" } });
});
