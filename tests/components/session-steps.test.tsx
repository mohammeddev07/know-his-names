import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { IntroStep } from "@/components/learning/intro-step";
import { RatingControls } from "@/components/learning/rating-controls";
import { RecallStep } from "@/components/learning/recall-step";
import { getNameById } from "@/lib/content/names";

const name = getNameById("ar-rahman")!;
const frame = { label: "Learning", step: 0, total: 3 };
const now = new Date("2026-09-13T09:00:00.000Z");
const minutes = (n: number) => new Date(now.getTime() + n * 60_000);
const preview = {
  again: minutes(1),
  hard: minutes(6),
  good: minutes(10),
  easy: minutes(8 * 24 * 60),
};

describe("learning card (IntroStep)", () => {
  it("shows the Arabic Name, transliteration, meaning and an honest explanation note", () => {
    render(
      <IntroStep name={name} frame={frame} busy={false} onContinue={vi.fn()} />,
    );
    const arabic = screen.getByText(name.arabic);
    expect(arabic).toHaveAttribute("lang", "ar");
    expect(arabic).toHaveAttribute("dir", "rtl");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      name.transliteration,
    );
    expect(screen.getByText(name.shortMeaning)).toBeVisible();
    expect(screen.getByText(name.explanation!)).toBeVisible();
    expect(
      screen.getByRole("progressbar", { name: "Learning progress" }),
    ).toBeInTheDocument();
  });

  it("continues with the button or the Enter key", async () => {
    const onContinue = vi.fn();
    const user = userEvent.setup();
    render(
      <IntroStep
        name={name}
        frame={frame}
        busy={false}
        onContinue={onContinue}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.keyboard("{Enter}");
    expect(onContinue).toHaveBeenCalledTimes(2);
  });
});

describe("review card (RecallStep)", () => {
  function renderRecall(onRate = vi.fn(), showTransliteration = true) {
    render(
      <RecallStep
        name={name}
        frame={{ ...frame, label: "Review" }}
        showTransliteration={showTransliteration}
        preview={preview}
        now={now}
        busy={false}
        onRate={onRate}
      />,
    );
    return onRate;
  }

  it("hides the meaning until the learner reveals it", async () => {
    const user = userEvent.setup();
    renderRecall();
    expect(screen.getByText("What does this Name mean?")).toBeVisible();
    expect(screen.queryByText(name.shortMeaning)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^Good/ }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reveal meaning" }));
    expect(screen.getByText(name.shortMeaning)).toBeVisible();
    expect(screen.getByRole("button", { name: /^Good/ })).toBeVisible();
  });

  it("reveals with Space and rates with the number keys", async () => {
    const user = userEvent.setup();
    const onRate = renderRecall();
    await user.keyboard(" ");
    expect(screen.getByText(name.shortMeaning)).toBeVisible();
    await user.keyboard("3");
    expect(onRate).toHaveBeenCalledWith("good");
    await user.keyboard("1");
    expect(onRate).toHaveBeenCalledWith("again");
  });

  it("can hide the transliteration visually while keeping it for screen readers", () => {
    renderRecall(vi.fn(), false);
    expect(screen.getByText(name.transliteration)).toHaveClass("sr-only");
  });
});

describe("rating controls", () => {
  it("offers Again, Hard, Good and Easy with their next review time", () => {
    render(<RatingControls preview={preview} now={now} onRate={vi.fn()} />);
    const group = screen.getByRole("group", {
      name: "How well did you remember it?",
    });
    expect(group).toBeVisible();
    expect(
      screen.getByRole("button", {
        name: /^Again: I didn't remember it, next review in 1 minute/,
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: /^Hard.*6 minutes/ }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: /^Good.*10 minutes/ }),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: /^Easy.*8 days/ })).toBeVisible();
  });

  it("reports the chosen rating", async () => {
    const onRate = vi.fn();
    render(<RatingControls preview={preview} now={now} onRate={onRate} />);
    await userEvent.click(screen.getByRole("button", { name: /^Hard/ }));
    expect(onRate).toHaveBeenCalledWith("hard");
  });

  it("can't be used twice while a rating is saving", () => {
    render(
      <RatingControls preview={null} now={now} onRate={vi.fn()} disabled />,
    );
    for (const button of screen.getAllByRole("button"))
      expect(button).toBeDisabled();
  });
});
