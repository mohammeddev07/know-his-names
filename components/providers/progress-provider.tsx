"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ProgressContext,
  type ProgressContextValue,
  type ProgressStatus,
} from "@/hooks/use-progress";
import { getNameById } from "@/lib/content/names";
import { startOfLocalDay } from "@/lib/learning/dates";
import {
  DEFAULT_PREFERENCES,
  type CardState,
  type UserPreferences,
} from "@/lib/learning/types";
import { FsrsReviewScheduler } from "@/lib/srs/scheduler";
import type { ReviewRating, ReviewResult } from "@/lib/srs/types";
import { IndexedDbProgressRepository } from "@/lib/storage/indexeddb-progress-repository";
import type { ProgressRepository } from "@/lib/storage/progress-repository";
import { applyTheme, readStoredTheme } from "@/lib/theme";

const SYNC_CHANNEL = "khn-progress";

interface State {
  status: ProgressStatus;
  cards: Map<string, CardState>;
  preferences: UserPreferences;
  reviewsToday: number;
  lastActivityAt: string | null;
}

function latestActivity(cards: Iterable<CardState>): string | null {
  let latest: string | null = null;
  for (const card of cards) {
    for (const time of [card.introducedAt, card.schedule.lastReview]) {
      if (time && (!latest || time > latest)) latest = time;
    }
  }
  return latest;
}

/** Cards for Names missing from the current content stay stored but are not shown. */
function byName(cards: CardState[]): Map<string, CardState> {
  return new Map(
    cards
      .filter((card) => getNameById(card.nameId))
      .map((card) => [card.nameId, card]),
  );
}

async function readState(repo: ProgressRepository): Promise<State> {
  const [cards, preferences, today] = await Promise.all([
    repo.getAllCardStates(),
    repo.getPreferences(),
    repo.getReviewHistory({ since: startOfLocalDay(new Date()) }),
  ]);
  return {
    status: "ready",
    cards: byName(cards),
    preferences,
    reviewsToday: today.length,
    lastActivityAt: latestActivity(cards),
  };
}

/** Asks the browser not to evict progress under storage pressure. Best effort. */
function requestPersistentStorage() {
  navigator.storage?.persist?.().catch(() => {});
}

/**
 * Owns the learner's progress for the UI. Components read it through
 * useProgress(); persistence goes through the repository and scheduling
 * through the ReviewScheduler, never directly from components.
 */
export function ProgressProvider({
  children,
  repository,
}: {
  children: ReactNode;
  repository?: ProgressRepository;
}) {
  const [{ repo, scheduler }] = useState(() => {
    const repo = repository ?? new IndexedDbProgressRepository();
    return { repo, scheduler: new FsrsReviewScheduler(repo) };
  });
  const [state, setState] = useState<State>(() => ({
    status: "loading",
    cards: new Map(),
    preferences: { ...DEFAULT_PREFERENCES, theme: readStoredThemeSafely() },
    reviewsToday: 0,
    lastActivityAt: null,
  }));
  const channel = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    let active = true;
    const refresh = () => {
      readState(repo).then(
        (next) => {
          if (!active) return;
          applyTheme(next.preferences.theme);
          setState(next);
        },
        (error) => {
          if (!active) return;
          console.warn("Progress storage is unavailable.", error);
          setState((prev) => ({ ...prev, status: "unavailable" }));
        },
      );
    };
    refresh();
    // Refresh when returning to the app: the day may have changed, or
    // another tab may have saved progress.
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    if (typeof BroadcastChannel !== "undefined") {
      channel.current = new BroadcastChannel(SYNC_CHANNEL);
      channel.current.onmessage = refresh;
    }
    return () => {
      active = false;
      document.removeEventListener("visibilitychange", onVisible);
      channel.current?.close();
      channel.current = null;
    };
  }, [repo]);

  const notifyOtherTabs = useCallback(() => {
    channel.current?.postMessage("changed");
  }, []);

  const introduce = useCallback(
    async (nameId: string) => {
      const card = await scheduler.introduce(nameId, new Date());
      setState((prev) => ({
        ...prev,
        cards: new Map(prev.cards).set(nameId, card),
        lastActivityAt: card.introducedAt,
      }));
      notifyOtherTabs();
      requestPersistentStorage();
    },
    [scheduler, notifyOtherTabs],
  );

  const review = useCallback(
    async (nameId: string, rating: ReviewRating): Promise<ReviewResult> => {
      const card = state.cards.get(nameId);
      if (!card) throw new Error(`No card for ${nameId}`);
      const result = await scheduler.recordReview(card.id, rating, new Date());
      setState((prev) => ({
        ...prev,
        cards: new Map(prev.cards).set(nameId, {
          ...card,
          schedule: result.next,
        }),
        reviewsToday: prev.reviewsToday + 1,
        lastActivityAt: result.reviewedAt,
      }));
      notifyOtherTabs();
      return result;
    },
    [scheduler, state.cards, notifyOtherTabs],
  );

  const preview = useCallback(
    (nameId: string) => {
      const card = state.cards.get(nameId);
      if (!card) return null;
      try {
        return scheduler.preview(card, new Date());
      } catch {
        return null;
      }
    },
    [scheduler, state.cards],
  );

  const updatePreferences = useCallback(
    async (patch: Partial<UserPreferences>) => {
      const previous = state.preferences;
      const next = { ...previous, ...patch };
      setState((prev) => ({ ...prev, preferences: next }));
      if (patch.theme) applyTheme(patch.theme);
      // Without storage, the theme still applies (it is mirrored locally).
      if (state.status !== "ready") return;
      try {
        await repo.savePreferences(next);
        notifyOtherTabs();
      } catch (error) {
        setState((prev) => ({ ...prev, preferences: previous }));
        if (patch.theme) applyTheme(previous.theme);
        throw error;
      }
    },
    [repo, state.preferences, state.status, notifyOtherTabs],
  );

  const loadHistory = useCallback(() => repo.getReviewHistory(), [repo]);

  const value = useMemo<ProgressContextValue>(
    () => ({
      ...state,
      introduce,
      review,
      preview,
      updatePreferences,
      loadHistory,
    }),
    [state, introduce, review, preview, updatePreferences, loadHistory],
  );

  return <ProgressContext value={value}>{children}</ProgressContext>;
}

function readStoredThemeSafely() {
  return typeof window === "undefined" ? "system" : readStoredTheme();
}
