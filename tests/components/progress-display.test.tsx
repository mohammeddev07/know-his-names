import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "@/components/learning/status-badge";
import { Mosaic, MosaicLegend } from "@/components/progress/mosaic";
import { ProgressView } from "@/components/progress/progress-view";
import { ProgressBar } from "@/components/ui/progress-bar";
import { NAMES } from "@/lib/content/names";
import {
  cardsByName,
  mockProgress,
  renderWithProgress,
  reviewCard,
} from "./test-utils";

describe("progress indicators", () => {
  it("exposes session progress to assistive technology", () => {
    render(<ProgressBar value={2} max={5} label="Review progress" />);
    const bar = screen.getByRole("progressbar", { name: "Review progress" });
    expect(bar).toHaveAttribute("aria-valuenow", "2");
    expect(bar).toHaveAttribute("aria-valuemax", "5");
  });

  it("draws every Name in the mosaic with a text summary", () => {
    const items = NAMES.map((name, i) => ({
      id: name.id,
      order: name.order,
      label: name.transliteration,
      status: i === 0 ? ("strong" as const) : ("not-started" as const),
    }));
    const { container } = render(
      <Mosaic items={items} label="1 of 99 Names introduced" />,
    );
    expect(
      screen.getByRole("img", { name: "1 of 99 Names introduced" }),
    ).toBeInTheDocument();
    expect(container.querySelectorAll("polygon")).toHaveLength(99);
    expect(container.querySelector("title")).toHaveTextContent(
      "1. Ar-Raḥmān: Strong",
    );
  });

  it("labels statuses in words, not colour alone", () => {
    render(
      <>
        <StatusBadge status="learning" />
        <MosaicLegend
          counts={{ "not-started": 90, learning: 4, reviewing: 3, strong: 2 }}
        />
      </>,
    );
    expect(screen.getAllByText("Learning")).toHaveLength(2);
    expect(screen.getByText("Not started")).toBeVisible();
    expect(screen.getByText("90")).toBeVisible();
  });
});

describe("progress page", () => {
  it("invites a new learner to start", () => {
    renderWithProgress(<ProgressView />);
    expect(
      screen.getByRole("link", { name: "Start learning" }),
    ).toHaveAttribute("href", "/learn");
    expect(
      screen.getByText("Nothing needs extra attention right now."),
    ).toBeVisible();
  });

  it("summarises statuses and lists Names needing attention", async () => {
    const value = mockProgress({
      cards: cardsByName(
        reviewCard("ar-rahman", { stability: 40 }),
        reviewCard("ar-rahim", { phase: "relearning", lapses: 1 }),
      ),
    });
    renderWithProgress(<ProgressView />, value);
    expect(screen.getByRole("link", { name: /Ar-Raḥīm/ })).toHaveAttribute(
      "href",
      "/names/ar-rahim",
    );
    expect(
      await screen.findByText(/You studied on 0 of the last 14 days/),
    ).toBeVisible();
  });
});
