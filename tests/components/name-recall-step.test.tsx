import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  NameRecallStep,
  type NameRecallStepProps,
} from "@/components/learning/name-recall-step";
import { NAMES, getNameById } from "@/lib/content/names";

const name = getNameById("ar-rahman")!;
const met = NAMES.slice(0, 6);
const frame = { label: "Review", step: 0, total: 3 };
const now = new Date("2026-09-13T09:00:00.000Z");
const minutes = (n: number) => new Date(now.getTime() + n * 60_000);
const preview = {
  again: minutes(1),
  hard: minutes(6),
  good: minutes(10),
  easy: minutes(8 * 24 * 60),
};

function renderStep(overrides: Partial<NameRecallStepProps> = {}) {
  const onRate = vi.fn();
  render(
    <NameRecallStep
      name={name}
      introduced={met}
      answerStyle="choice"
      frame={frame}
      showTransliteration
      preview={preview}
      now={now}
      busy={false}
      onRate={onRate}
      {...overrides}
    />,
  );
  return onRate;
}

const option = (transliteration: string) =>
  screen.getByRole("button", { name: new RegExp(transliteration) });

describe("Name card, choice style", () => {
  it("asks for the Name from its meaning, with four options", () => {
    renderStep();
    expect(screen.getByText("Which Name is this?")).toBeVisible();
    expect(screen.getByText(name.shortMeaning)).toBeVisible();
    const group = screen.getByRole("group", { name: "Choose the Name" });
    expect(group.querySelectorAll("button")).toHaveLength(4);
  });

  it("reports a right answer as good, only after Continue", async () => {
    const user = userEvent.setup();
    const onRate = renderStep();
    await user.click(option(name.transliteration));
    expect(screen.getByRole("status")).toHaveTextContent("That's right");
    expect(onRate).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(onRate).toHaveBeenCalledTimes(1);
    expect(onRate).toHaveBeenCalledWith("good");
  });

  it("reports a wrong answer as again and shows the right Name", async () => {
    const user = userEvent.setup();
    const onRate = renderStep();
    await user.click(option(met[1].transliteration));
    expect(screen.getByRole("status")).toHaveTextContent("Not quite");
    expect(screen.getByRole("status")).toHaveTextContent(name.transliteration);
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(onRate).toHaveBeenCalledWith("again");
  });

  it("locks the answer after the first tap", async () => {
    const user = userEvent.setup();
    const onRate = renderStep();
    await user.click(option(name.transliteration));
    await user.click(option(met[1].transliteration));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(onRate).toHaveBeenCalledTimes(1);
    expect(onRate).toHaveBeenCalledWith("good");
  });

  it("can't be answered while a rating is saving", () => {
    renderStep({ busy: true });
    for (const button of screen
      .getByRole("group", { name: "Choose the Name" })
      .querySelectorAll("button"))
      expect(button).toBeDisabled();
  });

  it("falls back to reveal when fewer than two options exist", async () => {
    const user = userEvent.setup();
    const onRate = renderStep({ introduced: [name] });
    expect(screen.queryByRole("group", { name: "Choose the Name" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Reveal Name" }));
    expect(screen.getByText(name.arabic)).toBeVisible();
    await user.click(screen.getByRole("button", { name: /^Good/ }));
    expect(onRate).toHaveBeenCalledWith("good");
  });
});

describe("Name card, reveal style", () => {
  it("hides the Name until revealed, then rates with the number keys", async () => {
    const user = userEvent.setup();
    const onRate = renderStep({ answerStyle: "reveal" });
    expect(screen.queryByText(name.arabic)).not.toBeInTheDocument();
    await user.keyboard(" ");
    expect(screen.getByText(name.arabic)).toBeVisible();
    await user.keyboard("3");
    expect(onRate).toHaveBeenCalledWith("good");
  });
});
