"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ButtonLink, Button } from "@/components/ui/button";
import { useNow } from "@/hooks/use-now";
import { useProgress, type ProgressContextValue } from "@/hooks/use-progress";
import { getNameById, NAMES } from "@/lib/content/names";
import { formatDue } from "@/lib/learning/dates";
import { nextDueDate } from "@/lib/learning/progress";
import {
  completeRecall,
  currentStep,
  isSessionComplete,
  remainingNewToday,
  selectDueNameIds,
  selectNewNames,
  sessionLength,
  shouldRepeatInSession,
  startReviewSession,
  type SessionState,
} from "@/lib/learning/session";
import type { ReviewRating } from "@/lib/srs/types";
import { RecallStep } from "./recall-step";
import { SessionLoading, SessionMessage } from "./session-states";
import { SessionSummary } from "./session-summary";
import { StorageUnavailable } from "./storage-unavailable";

const SAVE_ERROR =
  "That rating wasn't saved. Your earlier progress is safe. Please try again.";

function planSession(
  progress: ProgressContextValue,
  now: Date,
  requestedId: string | null,
): SessionState {
  if (requestedId) {
    return startReviewSession(
      progress.cards.has(requestedId) ? [requestedId] : [],
    );
  }
  return startReviewSession(selectDueNameIds(progress.cards, now));
}

export function ReviewSession() {
  const params = useSearchParams();
  const requestedId = params.get("name");
  const progress = useProgress();
  const now = useNow();
  const [session, setSession] = useState<SessionState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  const active =
    session ??
    (progress.status === "ready"
      ? planSession(progress, now, requestedId)
      : null);
  const step = active ? currentStep(active) : undefined;

  const onRate = (rating: ReviewRating) => {
    if (!active || step?.kind !== "recall") return;
    setBusy(true);
    setError(null);
    progress
      .review(step.nameId, rating)
      .then((result) => {
        const at = new Date();
        const nextDue = new Date(result.next.due);
        const repeat = shouldRepeatInSession(nextDue, at);
        setSession(completeRecall(active, rating, repeat));
        setStatus(
          repeat
            ? "You'll see this Name again shortly."
            : `Next review ${formatDue(nextDue, at)}.`,
        );
      })
      .catch(() => setError(SAVE_ERROR))
      .finally(() => setBusy(false));
  };

  if (progress.status === "loading") return <SessionLoading />;
  if (progress.status === "unavailable") return <StorageUnavailable />;
  if (!active) return <SessionLoading />;

  if (isSessionComplete(active)) {
    if (!session) return <NothingToReview requestedId={requestedId} />;
    const moreDue = selectDueNameIds(progress.cards, now).length;
    return (
      <SessionSummary
        session={active}
        nextDue={nextDueDate(progress.cards.values())}
        now={now}
        actions={
          <>
            {moreDue > 0 && !requestedId ? (
              <Button
                size="lg"
                block
                onClick={() => {
                  setSession(null);
                  setStatus("");
                }}
              >
                Review {moreDue} more
              </Button>
            ) : (
              <ButtonLink href="/" size="lg" block>
                Back to home
              </ButtonLink>
            )}
            <ButtonLink href="/progress" variant="quiet" size="lg" block>
              See your progress
            </ButtonLink>
          </>
        }
      />
    );
  }

  const name = step && getNameById(step.nameId);
  if (!step || !name) return <SessionLoading />;

  return (
    <RecallStep
      key={`${active.completed}-${step.nameId}`}
      name={name}
      frame={{
        label: requestedId ? "Practice" : "Review",
        step: active.completed,
        total: sessionLength(active),
        status,
        error,
      }}
      showTransliteration={progress.preferences.showTransliteration}
      preview={progress.preview(step.nameId)}
      now={now}
      busy={busy}
      onRate={onRate}
    />
  );
}

function NothingToReview({ requestedId }: { requestedId: string | null }) {
  const progress = useProgress();
  const now = useNow();
  const requested = requestedId ? getNameById(requestedId) : undefined;

  if (requested) {
    return (
      <SessionMessage
        title={`${requested.transliteration} isn't started yet`}
        actions={
          <ButtonLink href={`/learn?name=${requested.id}`} size="lg" block>
            Learn this Name
          </ButtonLink>
        }
      >
        <p>Meet it first, then it will join your reviews.</p>
      </SessionMessage>
    );
  }

  const nextDue = nextDueDate(progress.cards.values());
  const newAvailable = selectNewNames(
    NAMES,
    progress.cards,
    remainingNewToday(progress.cards, progress.preferences, now),
  ).length;

  return (
    <SessionMessage
      title="Nothing to review right now"
      actions={
        newAvailable > 0 ? (
          <ButtonLink href="/learn" size="lg" block>
            Learn {newAvailable} new {newAvailable === 1 ? "Name" : "Names"}
          </ButtonLink>
        ) : (
          <ButtonLink href="/" size="lg" block>
            Back to home
          </ButtonLink>
        )
      }
    >
      <p>
        {nextDue
          ? `Your next review is ${formatDue(nextDue, now)}. Reviews wait for you, so there's no need to rush.`
          : "Once you learn a Name, it will come back here for review."}
      </p>
    </SessionMessage>
  );
}
