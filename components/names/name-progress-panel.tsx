"use client";

import { StatusBadge } from "@/components/learning/status-badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/page";
import { useNow } from "@/hooks/use-now";
import { useProgress } from "@/hooks/use-progress";
import { formatDue } from "@/lib/learning/dates";
import { isDue } from "@/lib/learning/progress";
import { getStatus, needsAttention } from "@/lib/learning/status";

/** The learner's relationship with one Name, and the way to practise it. */
export function NameProgressPanel({ nameId }: { nameId: string }) {
  const progress = useProgress();
  const now = useNow();

  if (progress.status === "loading") {
    return (
      <div
        className="h-40 animate-pulse rounded-3xl bg-surface-2"
        aria-hidden="true"
      />
    );
  }
  if (progress.status === "unavailable") {
    return (
      <Card className="p-5 text-sm text-ink-2">
        Progress can&apos;t be saved in this browser, so practice isn&apos;t
        available here.
      </Card>
    );
  }

  const card = progress.cards.get(nameId);
  const status = getStatus(card);
  const reps = card?.schedule.reps ?? 0;

  let detail: string;
  if (!card) detail = "You haven't started this Name yet.";
  else if (isDue(card, now)) detail = "Ready for review now.";
  else detail = `Next review ${formatDue(new Date(card.schedule.due), now)}.`;

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={status} />
        {needsAttention(card) && (
          <span className="inline-flex h-7 items-center rounded-full bg-danger-soft px-2.5 text-xs font-medium text-danger">
            Needs attention
          </span>
        )}
      </div>
      <p className="mt-3 text-[0.9375rem] text-ink-2">
        {detail}
        {card &&
          reps > 0 &&
          ` Reviewed ${reps} ${reps === 1 ? "time" : "times"}.`}
      </p>
      <ButtonLink
        href={card ? `/review?name=${nameId}` : `/learn?name=${nameId}`}
        size="lg"
        block
        className="mt-5"
      >
        Practice this Name
      </ButtonLink>
    </Card>
  );
}
