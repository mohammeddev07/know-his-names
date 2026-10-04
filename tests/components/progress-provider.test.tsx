import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProgressProvider } from "@/components/providers/progress-provider";
import { useProgress } from "@/hooks/use-progress";
import { IndexedDbProgressRepository } from "@/lib/storage/indexeddb-progress-repository";
import { reviewCard } from "./test-utils";

let repo: IndexedDbProgressRepository;

beforeEach(() => {
  repo = new IndexedDbProgressRepository(`provider-${crypto.randomUUID()}`);
  // jsdom has no matchMedia; the provider's theme code reads it on load.
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    })),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function setup() {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ProgressProvider repository={repo}>{children}</ProgressProvider>
  );
  return renderHook(() => useProgress(), { wrapper });
}

const nameCard = (nameId: string) => ({
  ...reviewCard(nameId),
  id: `${nameId}:name`,
  cardType: "name" as const,
});

describe("ProgressProvider name cards", () => {
  it("splits stored cards into meaning and name maps", async () => {
    await repo.saveCardState(reviewCard("ar-rahman"));
    await repo.saveCardState(nameCard("ar-rahman"));
    const { result } = setup();
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.cards.get("ar-rahman")?.cardType).toBe("meaning");
    expect(result.current.nameCards.get("ar-rahman")?.cardType).toBe("name");
  });

  it("ignores name cards for Names missing from content", async () => {
    await repo.saveCardState(nameCard("gone"));
    const { result } = setup();
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.nameCards.size).toBe(0);
  });

  it("creates the name card on its first review", async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.status).toBe("ready"));

    await act(async () => {
      await result.current.review("ar-rahman", "good", "name");
    });
    expect((await repo.getCardState("ar-rahman:name"))?.schedule.reps).toBe(1);
    expect(result.current.nameCards.has("ar-rahman")).toBe(true);
    expect(result.current.cards.size).toBe(0);
  });

  it("still refuses to review a meaning card that doesn't exist", async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.status).toBe("ready"));
    await expect(result.current.review("ar-rahman", "good")).rejects.toThrow();
  });

  it("introduces and reviews the name card type without touching meaning cards", async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.status).toBe("ready"));

    await act(() => result.current.introduce("ar-rahman", "name"));
    expect(result.current.nameCards.has("ar-rahman")).toBe(true);
    expect(result.current.preview("ar-rahman", "name")).not.toBeNull();

    await act(async () => {
      await result.current.review("ar-rahman", "good", "name");
    });
    const stored = await repo.getCardState("ar-rahman:name");
    expect(stored?.schedule.reps).toBe(1);
    expect(result.current.cards.size).toBe(0);
    expect(await repo.getCardState("ar-rahman:meaning")).toBeNull();
  });
});
