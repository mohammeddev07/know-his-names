import type { ReviewRating, ScheduleState } from "@/lib/srs/types";
import type { ThemePreference } from "@/lib/theme";

/** V1 implements one card type: Arabic/transliteration → meaning. */
export type CardType = "meaning";

export interface LearningCard {
  id: string;
  nameId: string;
  cardType: CardType;
}

export interface CardState extends LearningCard {
  introducedAt: string;
  schedule: ScheduleState;
}

/** Append-only record of a single review. */
export interface ReviewEvent {
  id: string;
  cardId: string;
  reviewedAt: string;
  rating: ReviewRating;
  previousState: ScheduleState;
  resultingState: ScheduleState;
}

export const NEW_NAMES_PER_DAY_OPTIONS = [1, 2, 3, 5, 7] as const;
export type NewNamesPerDay = (typeof NEW_NAMES_PER_DAY_OPTIONS)[number];

export interface UserPreferences {
  newNamesPerDay: NewNamesPerDay;
  theme: ThemePreference;
  showTransliteration: boolean;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  newNamesPerDay: 3,
  theme: "system",
  showTransliteration: true,
};

/** Stable card identifier, e.g. "ar-rahman:meaning". */
export function cardIdFor(nameId: string, cardType: CardType = "meaning") {
  return `${nameId}:${cardType}`;
}
