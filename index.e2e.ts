import { test, expect } from "@playwright/test";
import cookieName from "./cookieName.ts";

// Use hard-coded credentials for the demonstration purposes
import USER_NAME from "./userName.ts";
import PASSWORD from "./password.ts";

const credential = btoa(`${USER_NAME}:${PASSWORD}`);

test("index auth", async ({ page }) => {
  await page.setExtraHTTPHeaders({
    Authorization: `Basic ${credential}`,
  });

  await page.goto("/");
  await expect(page).toHaveTitle("Bun Basic Auth Cookie");
});

test("index cookie", async ({ page }) => {
  await page.setExtraHTTPHeaders({
    Cookie: `${cookieName}=Basic ${credential}`,
  });

  await page.goto("/");
  await expect(page).toHaveTitle("Bun Basic Auth Cookie");
});

test("protected", async ({ page }) => {
  await page.setExtraHTTPHeaders({
    Cookie: `${cookieName}=Basic ${credential}`,
  });

  await page.goto("/user");
  await expect(page.locator(":root")).toHaveText(
    JSON.stringify(
      {
        user: USER_NAME,
        cookie: `Basic ${credential}`,
      },
      null,
      2
    )
  );
});

test.skip("protected iframe", async ({ page }) => {
  await page.setExtraHTTPHeaders({
    Cookie: `${cookieName}=Basic ${credential}`,
  });

  await page.goto("/");
  await expect(page.locator("iframe")).toBeVisible();

  const frame = page.frame("iframe");
  expect(frame).not.toBeNull();
  await expect(frame!.locator(":root")).toHaveText("hi");
});

test.skip("logout", ({}) => {});
