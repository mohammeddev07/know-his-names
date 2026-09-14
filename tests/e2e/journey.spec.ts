import fs from "node:fs";
import { expect, test, type Page } from "@playwright/test";

/**
 * Works through the current session. Ratings are used in order for each
 * recall, then Easy is used so the session can finish. After every action it
 * waits for the session to move on, so it never acts on an outgoing card.
 */
async function completeSession(page: Page, ratings: string[] = []) {
  const complete = page.getByRole("heading", { name: "Session complete" });
  const progress = page.getByRole("progressbar");
  const next = page.getByRole("button", { name: "Continue", exact: true });
  const reveal = page.getByRole("button", { name: "Reveal meaning" });
  let recall = 0;

  for (let step = 0; step < 40; step++) {
    await expect(complete.or(next).or(reveal)).toBeVisible();
    if (await complete.isVisible()) return;

    const before = await progress.getAttribute("aria-valuenow");
    if (await reveal.isVisible()) {
      await reveal.click();
      const rating = ratings[recall++] ?? "Easy";
      await page
        .getByRole("button", { name: new RegExp(`^${rating}\\b`) })
        .click();
    } else {
      await next.click();
    }

    await expect
      .poll(
        async () =>
          (await complete.isVisible()) ||
          (await progress
            .getAttribute("aria-valuenow", { timeout: 500 })
            .catch(() => before)) !== before,
      )
      .toBe(true);
  }
  throw new Error("The session did not finish");
}

async function clearProgress(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.deleteDatabase("know-his-names");
        request.onsuccess = () => resolve();
        request.onblocked = () => resolve();
        request.onerror = () => reject(request.error);
      }),
  );
  await page.evaluate(() => localStorage.clear());
}

const introduced = (page: Page, n: number) =>
  page.getByText(new RegExp(`^\\s*${n}\\s+of 99 Names introduced`));

async function exportBackup(page: Page, path: string) {
  await page.goto("/settings");
  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export progress" }).click();
  const download = await downloading;
  await download.saveAs(path);
  return download.suggestedFilename();
}

test("a new learner learns, reviews, keeps progress, and restores it from a backup", async ({
  page,
}, testInfo) => {
  // A new user opens the app: no account, one obvious way to begin.
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Assalamu alaikum" }),
  ).toBeVisible();
  await expect(introduced(page, 0)).toBeVisible();
  await page.getByRole("link", { name: "Start learning" }).click();

  // Learns three Names, attempting recall and using all four ratings.
  await completeSession(page, ["Again", "Hard", "Good", "Easy"]);
  const summary = page.locator("dl");
  for (const rating of ["Again", "Hard", "Good", "Easy"]) {
    await expect(
      summary.locator("div", { hasText: rating }).locator("dd"),
    ).not.toHaveText("0");
  }

  // Progress survives a reload.
  await page.goto("/");
  await page.reload();
  await expect(introduced(page, 3)).toBeVisible();
  await page.goto("/progress");
  await expect(page.getByText("Names introduced")).toBeVisible();

  // Exports a backup.
  const backupPath = testInfo.outputPath("backup.json");
  expect(await exportBackup(page, backupPath)).toMatch(
    /^know-his-names-backup-\d{4}-\d{2}-\d{2}\.json$/,
  );
  const backup = JSON.parse(fs.readFileSync(backupPath, "utf8"));
  expect(backup.format).toBe("know-his-names-backup");
  expect(backup.data.cards).toHaveLength(3);
  expect(backup.data.reviews.length).toBeGreaterThanOrEqual(4);

  // Test data is cleared: the app is back to a first visit.
  await clearProgress(page);
  await page.goto("/");
  await expect(introduced(page, 0)).toBeVisible();

  // Imports the backup after confirming, and progress is restored.
  await page.goto("/settings");
  await page.locator('input[type="file"]').setInputFiles(backupPath);
  const dialog = page.getByRole("dialog", { name: "Replace your progress?" });
  await expect(dialog).toContainText("3 Names introduced");
  await dialog.getByRole("button", { name: "Replace progress" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Progress imported" }),
  ).toBeVisible();

  await page.goto("/");
  await expect(introduced(page, 3)).toBeVisible();
  await page.reload();
  await expect(introduced(page, 3)).toBeVisible();
});

test("a damaged backup is rejected without changing progress", async ({
  page,
}) => {
  await page.goto("/settings");
  await page.locator('input[type="file"]').setInputFiles({
    name: "not-a-backup.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"format":"something-else"}'),
  });
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "isn't a Know His Names backup" }),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("cancelling an import keeps current progress", async ({
  page,
}, testInfo) => {
  await page.goto("/learn");
  await completeSession(page);
  const backupPath = testInfo.outputPath("backup.json");
  await exportBackup(page, backupPath);

  await page.locator('input[type="file"]').setInputFiles(backupPath);
  const dialog = page.getByRole("dialog", { name: "Replace your progress?" });
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();
  await page.goto("/");
  await expect(introduced(page, 3)).toBeVisible();
});
