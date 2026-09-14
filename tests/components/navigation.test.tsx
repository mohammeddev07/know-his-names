import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppHeader } from "@/components/navigation/app-header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { navigationState } from "../navigation-mock";

describe("navigation", () => {
  it("offers Home, Learn, Explore and Progress", () => {
    render(<BottomNav />);
    const nav = screen.getByRole("navigation", { name: "Primary" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual([
      "Home",
      "Learn",
      "Explore",
      "Progress",
    ]);
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/",
      "/learn",
      "/explore",
      "/progress",
    ]);
  });

  it("marks the current section, treating Name pages as part of Explore", () => {
    navigationState.pathname = "/names/ar-rahman";
    render(<BottomNav />);
    expect(screen.getByRole("link", { name: "Explore" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("keeps Settings in the header with an accessible name", () => {
    navigationState.pathname = "/settings";
    render(<AppHeader />);
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("link", { name: "Know His Names" }),
    ).toHaveAttribute("href", "/");
  });
});
