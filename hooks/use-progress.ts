"use client";

import { createContext, useContext } from "react";
import type { CardsByName } from "@/lib/learning/progress";
import type { ReviewEvent, UserPreferences } from "@/lib/learning/types";
import type {
  RatingPreview,
  ReviewRating,
  ReviewResult,
} from "@/lib/srs/types";

export type ProgressStatus = "loading" | "ready" | "unavailable";

/** Everything the UI knows about the learner, and the only way it changes it. */
export interface ProgressContextValue {
  status: ProgressStatus;
  cards: CardsByName;
  preferences: UserPreferences;
  reviewsToday: number;
  lastActivityAt: string | null;
  introduce(nameId: string): Promise<void>;
  review(nameId: string, rating: ReviewRating): Promise<ReviewResult>;
  preview(nameId: string): RatingPreview | null;
  updatePreferences(patch: Partial<UserPreferences>): Promise<void>;
  loadHistory(): Promise<ReviewEvent[]>;
}

export const ProgressContext = createContext<ProgressContextValue | null>(null);

export function useProgress(): ProgressContextValue {
  const value = useContext(ProgressContext);
  if (!value)
    throw new Error("useProgress must be used inside ProgressProvider");
  return value;
}
