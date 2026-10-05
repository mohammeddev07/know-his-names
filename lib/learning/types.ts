import type { ReviewRating, ScheduleState } from "@/lib/srs/types";
import type { ThemePreference } from "@/lib/theme";

/**
 * "meaning": Arabic/transliteration → meaning.
 * "name": meaning → Arabic/transliteration.
 * Each is scheduled independently, since knowing one is not knowing the other.
 */
export const CARD_TYPES = ["meaning", "name"] as const;
export type CardType = (typeof CARD_TYPES)[number];

export const REVIEW_MODES = ["meaning", "name", "mixed"] as const;
export type ReviewMode = (typeof REVIEW_MODES)[number];

export const NAME_ANSWER_STYLES = ["choice", "reveal"] as const;
export type NameAnswerStyle = (typeof NAME_ANSWER_STYLES)[number];

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
  reviewMode: ReviewMode;
  nameAnswerStyle: NameAnswerStyle;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  newNamesPerDay: 3,
  theme: "system",
  showTransliteration: true,
  reviewMode: "meaning",
  nameAnswerStyle: "choice",
};

/** Stable card identifier, e.g. "ar-rahman:meaning". */
export function cardIdFor(nameId: string, cardType: CardType = "meaning") {
  return `${nameId}:${cardType}`;
}
