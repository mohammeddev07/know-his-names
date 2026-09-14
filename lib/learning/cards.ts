import type { ScheduleState } from "@/lib/srs/types";
import { cardIdFor, type CardState } from "./types";

/** The card created when a learner first meets a Name. */
export function createCard(
  nameId: string,
  schedule: ScheduleState,
  introducedAt: Date,
): CardState {
  return {
    id: cardIdFor(nameId),
    nameId,
    cardType: "meaning",
    introducedAt: introducedAt.toISOString(),
    schedule,
  };
}
