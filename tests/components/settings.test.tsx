import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SettingsView } from "@/components/settings/settings-view";
import { mockProgress, renderWithProgress } from "./test-utils";

describe("practice settings", () => {
  it("defaults to meaning practice with choice answers", () => {
    renderWithProgress(<SettingsView />);
    expect(screen.getByRole("radio", { name: "Meaning" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Choose" })).toBeChecked();
  });

  it("saves the review mode and the Name answer style", async () => {
    const value = mockProgress({ updatePreferences: vi.fn(async () => {}) });
    renderWithProgress(<SettingsView />, value);
    await userEvent.click(screen.getByRole("radio", { name: "Mixed" }));
    expect(value.updatePreferences).toHaveBeenCalledWith({
      reviewMode: "mixed",
    });
    await userEvent.click(screen.getByRole("radio", { name: "Reveal" }));
    expect(value.updatePreferences).toHaveBeenCalledWith({
      nameAnswerStyle: "reveal",
    });
  });
});
