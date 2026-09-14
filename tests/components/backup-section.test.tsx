import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BackupSection } from "@/components/settings/backup-section";
import { DEFAULT_PREFERENCES } from "@/lib/learning/types";
import { createBackup, serializeBackup } from "@/lib/storage/backup";
import { mockProgress, renderWithProgress, reviewCard } from "./test-utils";

const snapshot = {
  cards: [reviewCard("ar-rahman"), reviewCard("ar-rahim")],
  reviews: [],
  preferences: DEFAULT_PREFERENCES,
};

const file = (text: string, name = "backup.json") =>
  new File([text], name, { type: "application/json" });

function fileInput() {
  return document.querySelector<HTMLInputElement>('input[type="file"]')!;
}

beforeEach(() => {
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  URL.createObjectURL = vi.fn(() => "blob:backup");
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("backup controls", () => {
  it("exports a dated backup file", async () => {
    const value = mockProgress({ exportSnapshot: vi.fn(async () => snapshot) });
    renderWithProgress(<BackupSection />, value);
    await userEvent.click(
      screen.getByRole("button", { name: "Export progress" }),
    );
    expect(value.exportSnapshot).toHaveBeenCalled();
    expect(await screen.findByRole("status")).toHaveTextContent(
      /Backup saved as know-his-names-backup-\d{4}-\d{2}-\d{2}\.json/,
    );
  });

  it("rejects a file that isn't a backup, without asking to replace anything", async () => {
    const value = mockProgress();
    renderWithProgress(<BackupSection />, value);
    await userEvent.upload(fileInput(), file("hello"));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "couldn't be read as a backup",
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(value.replaceProgress).not.toHaveBeenCalled();
  });

  it("asks for confirmation, then replaces progress and offers undo", async () => {
    const user = userEvent.setup();
    const value = mockProgress({
      getRollbackSavedAt: vi
        .fn<() => Promise<string | null>>()
        .mockResolvedValueOnce(null)
        .mockResolvedValue(new Date().toISOString()),
    });
    renderWithProgress(<BackupSection />, value);
    await user.upload(
      fileInput(),
      file(serializeBackup(createBackup(snapshot))),
    );

    const dialog = await screen.findByRole("dialog", {
      name: "Replace your progress?",
    });
    expect(dialog).toHaveTextContent("2 Names introduced and 0 reviews");
    expect(value.replaceProgress).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Replace progress" }));
    await waitFor(() =>
      expect(value.replaceProgress).toHaveBeenCalledWith(snapshot),
    );
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Progress imported",
    );

    await user.click(
      await screen.findByRole("button", { name: "Undo import" }),
    );
    expect(value.restoreRollback).toHaveBeenCalled();
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Your previous progress is back",
    );
  });

  it("changes nothing when the import is cancelled", async () => {
    const user = userEvent.setup();
    const value = mockProgress();
    renderWithProgress(<BackupSection />, value);
    await user.upload(
      fileInput(),
      file(serializeBackup(createBackup(snapshot))),
    );
    await user.click(await screen.findByRole("button", { name: "Cancel" }));
    expect(value.replaceProgress).not.toHaveBeenCalled();
  });

  it("is disabled until progress has loaded", () => {
    renderWithProgress(<BackupSection />, mockProgress({ status: "loading" }));
    expect(
      screen.getByRole("button", { name: "Export progress" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Import progress" }),
    ).toBeDisabled();
  });
});
