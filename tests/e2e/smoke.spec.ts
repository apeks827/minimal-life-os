import { expect, test } from "@playwright/test";

const stateKey = "lifeinbox.mvp.state";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate((key) => localStorage.removeItem(key), stateKey);
});

test("dashboard captures inbox, persists state, and supports record actions", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("LifeInbox").first()).toBeVisible();
  await expect(page.getByText(/Облако подсказок|Suggestion cloud/)).toBeVisible();

  await page.getByRole("button", { name: "Позвонить маме" }).click();
  await expect(page.getByPlaceholder(/Напишите что угодно/)).toHaveValue(/Позвонить маме/);
  await page.getByRole("button", { name: "Разобрать и добавить в план" }).click();
  await expect(page.getByText(/Позвонить маме/).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Готово" }).first()).toBeVisible();

  await page.reload();
  await expect(page.getByText(/Позвонить маме/).first()).toBeVisible();

  await page.getByRole("button", { name: "Готово" }).first().click();
  await expect(page.getByRole("button", { name: "Вернуть" }).first()).toBeVisible();
  await page.getByRole("button", { name: "Удалить" }).first().click();
  await expect(page.getByRole("button", { name: "Готово" })).toHaveCount(0);
});

test("language, onboarding and settings flows survive navigation", async ({ page, request }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "RU" }).click();
  await expect(page.getByPlaceholder(/Write anything/)).toBeVisible();

  await page.goto("/onboarding");
  await page.getByPlaceholder(/For example/).fill("Learn English and keep finances calm");
  await page.getByRole("button", { name: "Focus", exact: true }).click();
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByText(/Profile saved/)).toBeVisible();

  await page.goto("/settings#advanced");
  await expect(page.getByText("Advanced Settings")).toBeVisible();
  await page.getByLabel(/Daily task limit/).fill("3");
  await page.getByLabel("Test mode").check();
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(page.getByText(/Settings saved/)).toBeVisible();

  await page.goto("/");
  await expect(page.getByPlaceholder(/Write anything/)).toBeVisible();
  const stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "{}"), stateKey);
  expect(stored.settings.locale).toBe("en");
  expect(stored.settings.dailyTaskCount).toBe(3);
  expect(stored.settings.testMode).toBe(true);
  expect(stored.onboarding.focus).toContain("Learn English");

  const health = await request.get("/api/health");
  expect(health.ok()).toBe(true);
  expect(await health.json()).toMatchObject({ ok: true, dependencies: { app: "ok" } });
});

test("section navigation renders dedicated screens with shared dashboard", async ({ page }) => {
  await page.goto("/");
  await page.getByPlaceholder(/Напишите что угодно/).fill("встреча с командой завтра");
  await page.getByRole("button", { name: "Разобрать и добавить в план" }).click();
  await expect(page.getByText("встреча с командой завтра").first()).toBeVisible();

  const routes = [
    ["/today", "План на сегодня"],
    ["/tasks", "Задачи"],
    ["/goals", "Цели"],
    ["/habits", "Привычки"],
    ["/calendar", "Календарь"],
    ["/balance", "Колесо баланса"],
    ["/suggestions", "Подсказки"],
  ] as const;

  for (const [route, title] of routes) {
    await page.goto(route);
    await expect(page.getByRole("heading", { name: title }).first()).toBeVisible();
    await expect(page.getByText("LifeInbox").first()).toBeVisible();
  }
});
