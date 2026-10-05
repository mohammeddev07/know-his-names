import type { ScheduleState } from "@/lib/srs/types";
import { cardIdFor, type CardState, type CardType } from "./types";

/** The card created when a learner first meets a Name (or practises it a new way). */
export function createCard(
  nameId: string,
  schedule: ScheduleState,
  introducedAt: Date,
  cardType: CardType = "meaning",
): CardState {
  return {
    id: cardIdFor(nameId, cardType),
    nameId,
    cardType,
    introducedAt: introducedAt.toISOString(),
    schedule,
  };
}
