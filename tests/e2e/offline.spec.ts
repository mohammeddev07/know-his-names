import { expect, test, type Page } from "@playwright/test";

const isCached = (page: Page, path: string) =>
  page.evaluate(async (p) => Boolean(await caches.match(p)), path);

test("the installable app keeps working offline after the first visit", async ({
  page,
  context,
}) => {
  await page.goto("/");

  // The manifest is linked and describes an installable, standalone app.
  const href = await page.locator('link[rel="manifest"]').getAttribute("href");
  const manifest = await (await page.request.get(href!)).json();
  expect(manifest).toMatchObject({ display: "standalone", start_url: "/" });
  expect(
    manifest.icons.some((i: { purpose?: string }) => i.purpose === "maskable"),
  ).toBe(true);

  // The service worker takes control and saves the core pages and every Name.
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect
    .poll(() => isCached(page, "/explore"), { timeout: 20_000 })
    .toBe(true);
  await expect
    .poll(() => isCached(page, "/names/as-sabur"), { timeout: 30_000 })
    .toBe(true);

  await context.setOffline(true);

  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Assalamu alaikum" }),
  ).toBeVisible();
  await expect(page.getByText("You're offline")).toBeVisible();

  await page.goto("/explore");
  await expect(page.getByRole("heading", { name: "Explore" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Aṣ-Ṣabūr/ })).toBeVisible();

  await page.goto("/names/as-sabur");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Aṣ-Ṣabūr",
  );

  // Learning still works: progress is stored on the device.
  await page.goto("/learn");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByText("Ar-Raḥīm")).toBeVisible();

  await context.setOffline(false);
});
