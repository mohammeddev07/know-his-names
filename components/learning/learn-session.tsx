"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { useNow } from "@/hooks/use-now";
import { useProgress, type ProgressContextValue } from "@/hooks/use-progress";
import { getNameById, NAMES } from "@/lib/content/names";
import { formatDue } from "@/lib/learning/dates";
import { getDueCards, nextDueDate } from "@/lib/learning/progress";
import {
  completeIntroduction,
  completeRecall,
  currentStep,
  isSessionComplete,
  remainingNewToday,
  selectNewNames,
  sessionLength,
  shouldRepeatInSession,
  startLearnSession,
  startReviewSession,
  type SessionState,
} from "@/lib/learning/session";
import type { ReviewRating } from "@/lib/srs/types";
import { IntroStep } from "./intro-step";
import { RecallStep } from "./recall-step";
import { SessionLoading, SessionMessage } from "./session-states";
import { SessionSummary } from "./session-summary";
import { StorageUnavailable } from "./storage-unavailable";

const SAVE_ERROR =
  "That step wasn't saved. Your earlier progress is safe. Please try again.";

function planSession(
  progress: ProgressContextValue,
  now: Date,
  requestedId: string | null,
  more: boolean,
): SessionState {
  if (requestedId && getNameById(requestedId)) {
    return progress.cards.has(requestedId)
      ? startReviewSession([requestedId])
      : startLearnSession([requestedId]);
  }
  const limit = more
    ? progress.preferences.newNamesPerDay
    : remainingNewToday(progress.cards, progress.preferences, now);
  return startLearnSession(
    selectNewNames(NAMES, progress.cards, limit).map((name) => name.id),
  );
}

export function LearnSession() {
  const params = useSearchParams();
  const progress = useProgress();
  const now = useNow();
  const [session, setSession] = useState<SessionState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  const active =
    session ??
    (progress.status === "ready"
      ? planSession(progress, now, params.get("name"), params.has("more"))
      : null);

  const run = async (task: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await task();
    } catch {
      setError(SAVE_ERROR);
    } finally {
      setBusy(false);
    }
  };

  const step = active ? currentStep(active) : undefined;

  const onContinue = () => {
    if (!active || step?.kind !== "introduce") return;
    void run(async () => {
      await progress.introduce(step.nameId);
      setSession(completeIntroduction(active));
      setStatus("");
    });
  };

  const onRate = (rating: ReviewRating) => {
    if (!active || step?.kind !== "recall") return;
    void run(async () => {
      const result = await progress.review(step.nameId, rating);
      const at = new Date();
      const nextDue = new Date(result.next.due);
      const repeat = shouldRepeatInSession(nextDue, at);
      setSession(completeRecall(active, rating, repeat));
      setStatus(
        repeat
          ? "You'll see this Name again shortly."
          : `Next review ${formatDue(nextDue, at)}.`,
      );
    });
  };

  if (progress.status === "loading") return <SessionLoading />;
  if (progress.status === "unavailable") return <StorageUnavailable />;
  if (!active) return <SessionLoading />;

  if (isSessionComplete(active)) {
    if (!session) return <NothingToLearn />;
    const due = getDueCards(progress.cards.values(), now).length;
    return (
      <SessionSummary
        session={active}
        nextDue={nextDueDate(progress.cards.values())}
        now={now}
        actions={
          <>
            {due > 0 ? (
              <ButtonLink href="/review" size="lg" block>
                Review {due} {due === 1 ? "Name" : "Names"}
              </ButtonLink>
            ) : (
              <ButtonLink href="/" size="lg" block>
                Back to home
              </ButtonLink>
            )}
            <ButtonLink href="/explore" variant="quiet" size="lg" block>
              Explore the Names
            </ButtonLink>
          </>
        }
      />
    );
  }

  const name = step && getNameById(step.nameId);
  if (!step || !name) return <SessionLoading />;

  const frame = {
    label: "Learning",
    step: active.completed,
    total: sessionLength(active),
    status,
    error,
  };
  const key = `${active.completed}-${step.kind}-${step.nameId}`;

  return step.kind === "introduce" ? (
    <IntroStep
      key={key}
      name={name}
      frame={frame}
      busy={busy}
      onContinue={onContinue}
    />
  ) : (
    <RecallStep
      key={key}
      name={name}
      frame={frame}
      showTransliteration={progress.preferences.showTransliteration}
      preview={progress.preview(step.nameId)}
      now={now}
      busy={busy}
      onRate={onRate}
    />
  );
}

function NothingToLearn() {
  const progress = useProgress();
  const now = useNow();
  const allIntroduced = progress.cards.size >= NAMES.length;
  const due = getDueCards(progress.cards.values(), now).length;

  if (allIntroduced) {
    return (
      <SessionMessage
        title="You've met all 99 Names"
        actions={
          due > 0 ? (
            <ButtonLink href="/review" size="lg" block>
              Review {due} {due === 1 ? "Name" : "Names"}
            </ButtonLink>
          ) : (
            <ButtonLink href="/" size="lg" block>
              Back to home
            </ButtonLink>
          )
        }
      >
        <p>Keep reviewing so each one stays with you.</p>
      </SessionMessage>
    );
  }

  return (
    <SessionMessage
      title="Today's new Names are learned"
      actions={
        <>
          {due > 0 ? (
            <ButtonLink href="/review" size="lg" block>
              Review {due} {due === 1 ? "Name" : "Names"}
            </ButtonLink>
          ) : (
            <ButtonLink href="/" size="lg" block>
              Back to home
            </ButtonLink>
          )}
          <ButtonLink href="/learn?more=1" variant="quiet" size="lg" block>
            Learn more today
          </ButtonLink>
        </>
      }
    >
      <p>
        Letting new Names settle helps them stay. More will be ready tomorrow.
      </p>
    </SessionMessage>
  );
}
