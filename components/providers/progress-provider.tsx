"use client";

// Phase 2: backed by in-memory DEVELOPMENT SAMPLE DATA. Replaced in Phase 4.
import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  ProgressContext,
  type ProgressContextValue,
} from "@/hooks/use-progress";
import { createSampleCards, SAMPLE_INTERVALS } from "@/lib/dev/sample-progress";
import {
  cardIdFor,
  DEFAULT_PREFERENCES,
  type CardState,
  type UserPreferences,
} from "@/lib/learning/types";
import { REVIEW_RATINGS, type ReviewRating } from "@/lib/srs/types";
import { applyTheme } from "@/lib/theme";

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [cards, setCards] = useState(() => createSampleCards(new Date()));
  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [reviewsToday, setReviewsToday] = useState(8);

  const introduce = useCallback(async (nameId: string) => {
    const now = new Date();
    setCards((prev) => {
      const next = new Map(prev);
      const card: CardState = {
        id: cardIdFor(nameId),
        nameId,
        cardType: "meaning",
        introducedAt: now.toISOString(),
        schedule: {
          due: now.toISOString(),
          stability: 0,
          difficulty: 0,
          elapsedDays: 0,
          scheduledDays: 0,
          learningSteps: 0,
          reps: 0,
          lapses: 0,
          phase: "new",
          lastReview: null,
        },
      };
      next.set(nameId, card);
      return next;
    });
  }, []);

  const review = useCallback(
    async (nameId: string, rating: ReviewRating) => {
      const now = new Date();
      const card = cards.get(nameId);
      if (!card) throw new Error("Unknown card");
      const nextSchedule = {
        ...card.schedule,
        due: new Date(now.getTime() + SAMPLE_INTERVALS[rating]).toISOString(),
        phase:
          rating === "again" ? ("relearning" as const) : ("review" as const),
        reps: card.schedule.reps + 1,
        lastReview: now.toISOString(),
      };
      setCards((prev) =>
        new Map(prev).set(nameId, { ...card, schedule: nextSchedule }),
      );
      setReviewsToday((n) => n + 1);
      return {
        cardId: card.id,
        rating,
        reviewedAt: now.toISOString(),
        previous: card.schedule,
        next: nextSchedule,
      };
    },
    [cards],
  );

  const preview = useCallback(() => {
    const now = Date.now();
    return Object.fromEntries(
      REVIEW_RATINGS.map((r) => [r, new Date(now + SAMPLE_INTERVALS[r])]),
    ) as Record<ReviewRating, Date>;
  }, []);

  const updatePreferences = useCallback(
    async (patch: Partial<UserPreferences>) => {
      setPreferences((prev) => ({ ...prev, ...patch }));
      if (patch.theme) applyTheme(patch.theme);
    },
    [],
  );

  const value = useMemo<ProgressContextValue>(
    () => ({
      status: "ready",
      cards,
      preferences,
      reviewsToday,
      lastActivityAt: null,
      introduce,
      review,
      preview,
      updatePreferences,
      loadHistory: async () => [],
    }),
    [
      cards,
      preferences,
      reviewsToday,
      introduce,
      review,
      preview,
      updatePreferences,
    ],
  );

  return <ProgressContext value={value}>{children}</ProgressContext>;
}
