"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import { describeInterval, formatInterval } from "@/lib/learning/dates";
import {
  REVIEW_RATINGS,
  type RatingPreview,
  type ReviewRating,
} from "@/lib/srs/types";

export const RATING_META: Record<
  ReviewRating,
  { label: string; description: string; dot: string }
> = {
  again: {
    label: "Again",
    description: "I didn't remember it",
    dot: "bg-danger",
  },
  hard: {
    label: "Hard",
    description: "I remembered it with difficulty",
    dot: "bg-gold",
  },
  good: { label: "Good", description: "I remembered it", dot: "bg-primary" },
  easy: {
    label: "Easy",
    description: "I remembered it instantly",
    dot: "bg-primary/45",
  },
};

interface RatingControlsProps {
  preview: RatingPreview | null;
  now: Date;
  onRate: (rating: ReviewRating) => void;
  disabled?: boolean;
}

export function RatingControls({
  preview,
  now,
  onRate,
  disabled,
}: RatingControlsProps) {
  const labelId = useId();
  return (
    <div className="animate-fade">
      <p id={labelId} className="mb-3 text-center text-sm text-ink-2">
        How well did you remember it?
      </p>
      <div
        role="group"
        aria-labelledby={labelId}
        className="grid grid-cols-4 gap-2"
      >
        {REVIEW_RATINGS.map((rating, index) => {
          const meta = RATING_META[rating];
          const interval = preview
            ? preview[rating].getTime() - now.getTime()
            : null;
          return (
            <button
              key={rating}
              type="button"
              disabled={disabled}
              onClick={() => onRate(rating)}
              aria-keyshortcuts={String(index + 1)}
              title={meta.description}
              className={cn(
                "relative flex h-[4.5rem] flex-col items-center justify-center gap-1 rounded-2xl border border-line bg-surface shadow-card",
                "transition-[border-color,background-color,transform] duration-200 ease-calm",
                "hover:border-line-strong hover:bg-surface-2 active:scale-[0.96] disabled:opacity-60",
              )}
            >
              <span className="flex items-center gap-1.5 text-[0.9375rem] font-semibold text-ink">
                <span
                  aria-hidden="true"
                  className={cn("size-2 rounded-full", meta.dot)}
                />
                {meta.label}
              </span>
              <span className="sr-only">: {meta.description}</span>
              {interval !== null && (
                <span className="text-xs text-ink-3 tabular-nums">
                  <span aria-hidden="true">{formatInterval(interval)}</span>
                  <span className="sr-only">
                    , next review in {describeInterval(interval)}
                  </span>
                </span>
              )}
              <kbd
                aria-hidden="true"
                className="absolute top-1.5 right-2.5 hidden font-sans text-[0.6875rem] text-ink-3/70 [@media(hover:hover)]:block"
              >
                {index + 1}
              </kbd>
            </button>
          );
        })}
      </div>
    </div>
  );
}
