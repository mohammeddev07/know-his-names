import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { ModePicker } from "@/components/learning/mode-picker";
import type { ReviewMode } from "@/lib/learning/types";

/** Changing mode re-plans the session, which rebuilds the picker; `key` mimics that. */
function Rebuilt() {
  const [mode, setMode] = useState<ReviewMode>("meaning");
  return <ModePicker key={mode} value={mode} onChange={setMode} />;
}

describe("ModePicker", () => {
  it("keeps keyboard focus on the chosen mode after the session is rebuilt", async () => {
    const user = userEvent.setup();
    render(<Rebuilt />);
    await user.click(screen.getByRole("radio", { name: "Name" }));
    await waitFor(() =>
      expect(screen.getByRole("radio", { name: "Name" })).toHaveFocus(),
    );
    // Arrow keys keep working from there.
    await user.keyboard("{ArrowRight}");
    await waitFor(() =>
      expect(screen.getByRole("radio", { name: "Mixed" })).toHaveFocus(),
    );
  });
});
