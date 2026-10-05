"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ButtonLink, Button } from "@/components/ui/button";
import { useNow } from "@/hooks/use-now";
import { useProgress, type ProgressContextValue } from "@/hooks/use-progress";
import { getNameById, NAMES } from "@/lib/content/names";
import { formatDue } from "@/lib/learning/dates";
import { getDueCards, nextDueDate } from "@/lib/learning/progress";
import {
  completeRecall,
  currentStep,
  isSessionComplete,
  remainingNewToday,
  selectNewNames,
  selectReviewSteps,
  sessionLength,
  shouldRepeatInSession,
  startReviewSession,
  type SessionState,
} from "@/lib/learning/session";
import type { ReviewMode } from "@/lib/learning/types";
import type { ReviewRating } from "@/lib/srs/types";
import { ModePicker } from "./mode-picker";
import { NameRecallStep } from "./name-recall-step";
import { RecallStep } from "./recall-step";
import { SessionLoading, SessionMessage } from "./session-states";
import { SessionSummary } from "./session-summary";
import { StorageUnavailable } from "./storage-unavailable";

const SAVE_ERROR =
  "That rating wasn't saved. Your earlier progress is safe. Please try again.";
const MODE_ERROR = "That change wasn't saved. Please try again.";

function planSession(
  progress: ProgressContextValue,
  now: Date,
  requestedId: string | null,
): SessionState {
  if (requestedId) {
    return startReviewSession(
      progress.cards.has(requestedId)
        ? [{ nameId: requestedId, cardType: "meaning" }]
        : [],
    );
  }
  return startReviewSession(planSteps(progress, now));
}

function planSteps(progress: ProgressContextValue, now: Date) {
  return selectReviewSteps(
    progress.cards,
    progress.nameCards,
    progress.preferences.reviewMode,
    progress.preferences,
    now,
  );
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
      .review(step.nameId, rating, step.cardType)
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

  // Before the first answer the plan is derived from preferences, so changing
  // the mode simply re-plans the session.
  const onModeChange = (reviewMode: ReviewMode) => {
    setError(null);
    progress
      .updatePreferences({ reviewMode })
      .catch(() => setError(MODE_ERROR));
  };

  if (progress.status === "loading") return <SessionLoading />;
  if (progress.status === "unavailable") return <StorageUnavailable />;
  if (!active) return <SessionLoading />;

  if (isSessionComplete(active)) {
    if (!session) return <NothingToReview requestedId={requestedId} />;
    const moreDue = planSteps(progress, now).length;
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

  const name = step?.kind === "recall" ? getNameById(step.nameId) : undefined;
  if (step?.kind !== "recall" || !name) return <SessionLoading />;

  const frame = {
    label: requestedId ? "Practice" : "Review",
    step: active.completed,
    total: sessionLength(active),
    status,
    error,
    controls:
      active.completed === 0 && !requestedId ? (
        <ModePicker
          value={progress.preferences.reviewMode}
          onChange={onModeChange}
          disabled={busy}
        />
      ) : undefined,
  };
  const common = {
    name,
    frame,
    showTransliteration: progress.preferences.showTransliteration,
    preview: progress.preview(step.nameId, step.cardType),
    now,
    busy,
    onRate,
  };
  const key = `${active.completed}-${step.nameId}-${step.cardType}`;

  return step.cardType === "name" ? (
    <NameRecallStep
      key={key}
      {...common}
      introduced={NAMES.filter((n) => progress.cards.has(n.id))}
      answerStyle={progress.preferences.nameAnswerStyle}
    />
  ) : (
    <RecallStep key={key} {...common} />
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

  // Only the cards this mode schedules count towards "next review". In Name
  // mode, meaning reviews may still be waiting, so say so rather than "now".
  const { reviewMode } = progress.preferences;
  const nextDue = nextDueDate([
    ...(reviewMode === "name" ? [] : progress.cards.values()),
    ...(reviewMode === "meaning" ? [] : progress.nameCards.values()),
  ]);
  const meaningWaiting =
    reviewMode === "name"
      ? getDueCards(progress.cards.values(), now).length
      : 0;
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
        {meaningWaiting > 0
          ? `${meaningWaiting} meaning ${meaningWaiting === 1 ? "review is" : "reviews are"} waiting. Switch to Meaning or Mixed to do ${meaningWaiting === 1 ? "it" : "them"}.`
          : nextDue
            ? `Your next review is ${formatDue(nextDue, now)}. Reviews wait for you, so there's no need to rush.`
            : "Once you learn a Name, it will come back here for review."}
      </p>
      <div className="mt-6 text-left">
        <ModePicker
          value={progress.preferences.reviewMode}
          onChange={(reviewMode) => {
            // updatePreferences restores the previous value if saving fails.
            progress.updatePreferences({ reviewMode }).catch(() => {});
          }}
        />
      </div>
    </SessionMessage>
  );
}
