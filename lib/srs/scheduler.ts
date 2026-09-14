import { createId } from "@/lib/id";
import { createCard } from "@/lib/learning/cards";
import { getDueCards } from "@/lib/learning/progress";
import {
  cardIdFor,
  type CardState,
  type ReviewEvent,
} from "@/lib/learning/types";
import type { ProgressRepository } from "@/lib/storage/progress-repository";
import { applyRating, createSchedule, previewRatings } from "./fsrs-adapter";
import type {
  RatingPreview,
  ReviewRating,
  ReviewResult,
  ReviewScheduler,
} from "./types";

/**
 * ReviewScheduler backed by FSRS and a ProgressRepository. The next state is
 * computed before anything is written, and the new card state and its review
 * event are then saved together, so a failure never leaves partial progress.
 */
export class FsrsReviewScheduler implements ReviewScheduler {
  constructor(private readonly repository: ProgressRepository) {}

  async getDueCards(now: Date): Promise<CardState[]> {
    return getDueCards(await this.repository.getAllCardStates(), now);
  }

  async introduce(nameId: string, now: Date): Promise<CardState> {
    const existing = await this.repository.getCardState(cardIdFor(nameId));
    if (existing) return existing;
    const card = createCard(nameId, createSchedule(now), now);
    await this.repository.saveCardState(card);
    return card;
  }

  async recordReview(
    cardId: string,
    rating: ReviewRating,
    reviewedAt: Date,
  ): Promise<ReviewResult> {
    const card = await this.repository.getCardState(cardId);
    if (!card) throw new Error(`No card with id "${cardId}"`);
    const next = applyRating(card.schedule, rating, reviewedAt);
    const event: ReviewEvent = {
      id: createId(),
      cardId,
      reviewedAt: reviewedAt.toISOString(),
      rating,
      previousState: card.schedule,
      resultingState: next,
    };
    await this.repository.saveReview({ ...card, schedule: next }, event);
    return {
      cardId,
      rating,
      reviewedAt: event.reviewedAt,
      previous: card.schedule,
      next,
    };
  }

  preview(card: CardState, now: Date): RatingPreview {
    return previewRatings(card.schedule, now);
  }
}
