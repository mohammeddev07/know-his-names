import { formatDue } from "@/lib/learning/dates";
import type { SessionState } from "@/lib/learning/session";
import { REVIEW_RATINGS } from "@/lib/srs/types";
import type { ReactNode } from "react";
import { RATING_META } from "./rating-controls";
import { SessionMessage } from "./session-states";

interface SessionSummaryProps {
  session: SessionState;
  nextDue: Date | null;
  now: Date;
  actions: ReactNode;
}

function names(n: number) {
  return `${n} ${n === 1 ? "Name" : "Names"}`;
}

export function SessionSummary({
  session,
  nextDue,
  now,
  actions,
}: SessionSummaryProps) {
  const learned = session.introduced.length;
  const recalled = session.recalled.length;
  const message =
    learned > 0
      ? `You met ${learned === 1 ? "1 new Name" : `${learned} new Names`} and practised recalling ${learned === 1 ? "it" : "them"}.`
      : `You reviewed ${names(recalled)}.`;

  return (
    <SessionMessage title="Session complete" actions={actions}>
      <p>{message}</p>
      <dl className="mt-8 grid grid-cols-4 overflow-hidden rounded-2xl border border-line bg-surface text-center shadow-card">
        {REVIEW_RATINGS.map((rating) => (
          <div key={rating} className="border-line px-2 py-3 not-last:border-r">
            <dt className="flex items-center justify-center gap-1.5 text-xs text-ink-2">
              <span
                aria-hidden="true"
                className={`size-1.5 rounded-full ${RATING_META[rating].dot}`}
              />
              {RATING_META[rating].label}
            </dt>
            <dd className="mt-1 font-serif text-2xl text-ink tabular-nums">
              {session.ratings[rating]}
            </dd>
          </div>
        ))}
      </dl>
      {nextDue && (
        <p className="mt-6 text-sm">
          Your next review is {formatDue(nextDue, now)}.
        </p>
      )}
    </SessionMessage>
  );
}
