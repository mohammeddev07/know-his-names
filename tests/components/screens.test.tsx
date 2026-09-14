import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ExploreView } from "@/components/explore/explore-view";
import { HomeView } from "@/components/home/home-view";
import { LearnSession } from "@/components/learning/learn-session";
import { ReviewSession } from "@/components/learning/review-session";
import {
  cardsByName,
  mockProgress,
  renderWithProgress,
  reviewCard,
} from "./test-utils";

describe("home", () => {
  it("gives a first-time learner one obvious way to begin", () => {
    renderWithProgress(<HomeView />);
    expect(
      screen.getByRole("heading", { name: "Begin with 3 Names" }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Start learning" }),
    ).toHaveAttribute("href", "/learn");
    expect(screen.getByRole("heading", { name: "How it works" })).toBeVisible();
    expect(screen.getByText(/No account needed/)).toBeVisible();
  });

  it("puts due reviews first, with new Names as the secondary action", () => {
    const value = mockProgress({
      cards: cardsByName(reviewCard("ar-rahman"), reviewCard("ar-rahim")),
    });
    renderWithProgress(<HomeView />, value);
    expect(
      screen.getByRole("heading", { name: "Review 2 Names" }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Start review" })).toHaveAttribute(
      "href",
      "/review",
    );
    expect(
      screen.getByRole("link", { name: "Learn 3 new Names" }),
    ).toHaveAttribute("href", "/learn");
  });

  it("explains calmly when progress can't be saved", () => {
    renderWithProgress(<HomeView />, mockProgress({ status: "unavailable" }));
    expect(
      screen.getByText(/Progress can't be saved in this browser/),
    ).toBeVisible();
    expect(
      screen.queryByRole("link", { name: "Start learning" }),
    ).not.toBeInTheDocument();
  });
});

describe("explore", () => {
  it("lists all 99 Names and finds them by meaning, name or number", async () => {
    const user = userEvent.setup();
    renderWithProgress(<ExploreView />);
    expect(screen.getAllByRole("listitem")).toHaveLength(99);

    const search = screen.getByRole("searchbox", { name: "Search the Names" });
    await user.type(search, "king");
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByRole("link", { name: /Al-Malik/ })).toHaveAttribute(
      "href",
      "/names/al-malik",
    );

    await user.clear(search);
    await user.type(search, "99");
    expect(screen.getByRole("link", { name: /Aṣ-Ṣabūr/ })).toBeVisible();
  });

  it("shows a helpful empty state and a way back", async () => {
    const user = userEvent.setup();
    renderWithProgress(<ExploreView />);
    await user.type(screen.getByRole("searchbox"), "zzzz");
    expect(screen.getByText("No Names match")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Show all Names" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(99);
  });

  it("filters by learning status", async () => {
    const user = userEvent.setup();
    const value = mockProgress({
      cards: cardsByName(reviewCard("al-malik", { stability: 40 })),
    });
    renderWithProgress(<ExploreView />, value);
    const filters = screen.getByRole("group", {
      name: "Filter by learning status",
    });
    await user.click(within(filters).getByRole("button", { name: /Strong/ }));
    expect(
      within(filters).getByRole("button", { name: /Strong/ }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });
});

describe("session empty states", () => {
  it("says when nothing is due and offers new Names", () => {
    renderWithProgress(<ReviewSession />);
    expect(
      screen.getByRole("heading", { name: "Nothing to review right now" }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Learn 3 new Names" }),
    ).toHaveAttribute("href", "/learn");
  });

  it("respects the daily limit without blocking a keen learner", () => {
    const today = [
      reviewCard("ar-rahman"),
      reviewCard("ar-rahim"),
      reviewCard("al-malik"),
    ].map((card) => ({
      ...card,
      introducedAt: new Date().toISOString(),
      schedule: {
        ...card.schedule,
        due: new Date(Date.now() + 86_400_000).toISOString(),
      },
    }));
    renderWithProgress(
      <LearnSession />,
      mockProgress({ cards: cardsByName(...today) }),
    );
    expect(
      screen.getByRole("heading", { name: "Today's new Names are learned" }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Learn more today" }),
    ).toHaveAttribute("href", "/learn?more=1");
  });

  it("starts a first session straight away", () => {
    renderWithProgress(<LearnSession />);
    expect(screen.getByText("New Name")).toBeVisible();
    expect(screen.getByRole("button", { name: "Continue" })).toBeVisible();
  });
});
