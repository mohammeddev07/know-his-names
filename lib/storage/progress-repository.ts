import type {
  CardState,
  ReviewEvent,
  UserPreferences,
} from "@/lib/learning/types";

/** Everything the learner has, in a storage-independent shape. */
export interface ProgressSnapshot {
  cards: CardState[];
  reviews: ReviewEvent[];
  preferences: UserPreferences;
}

export interface ReviewHistoryQuery {
  cardId?: string;
  since?: Date;
}

/**
 * Application-owned persistence contract. V1 stores progress in IndexedDB;
 * a V2 cloud repository would implement the same interface.
 */
export interface ProgressRepository {
  getCardState(cardId: string): Promise<CardState | null>;
  getAllCardStates(): Promise<CardState[]>;
  saveCardState(state: CardState): Promise<void>;
  /** Saves the card's new state and appends its review event in one atomic write. */
  saveReview(state: CardState, event: ReviewEvent): Promise<void>;
  /** Review events, oldest first. Events are append-only. */
  getReviewHistory(query?: ReviewHistoryQuery): Promise<ReviewEvent[]>;
  getPreferences(): Promise<UserPreferences>;
  savePreferences(preferences: UserPreferences): Promise<void>;
  exportSnapshot(): Promise<ProgressSnapshot>;
  /**
   * Atomically replaces all progress. The progress being replaced is kept so
   * it can be restored with restoreRollback().
   */
  replaceAll(snapshot: ProgressSnapshot): Promise<void>;
  /** When the progress kept by the last replaceAll() was saved, if any. */
  getRollbackSavedAt(): Promise<string | null>;
  restoreRollback(): Promise<void>;
}

/** The browser won't let the app store data (e.g. storage disabled). */
export class StorageUnavailableError extends Error {
  constructor(cause?: unknown) {
    super("Local storage is unavailable in this browser", { cause });
    this.name = "StorageUnavailableError";
  }
}
