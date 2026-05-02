import { expect, test } from "@playwright/test";

test("home classifies inbox item and exposes health endpoint", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.getByText("LifeInbox").first()).toBeVisible();
  await page.getByPlaceholder(/Напишите что угодно/).fill("купить молоко завтра");
  await page.getByRole("button", { name: /Разобрать/ }).click();
  await expect(page.getByText("купить молоко завтра").first()).toBeVisible();

  const health = await request.get("/api/health");
  expect(health.ok()).toBe(true);
});
