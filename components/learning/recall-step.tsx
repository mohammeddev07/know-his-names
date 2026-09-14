"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useShortcuts } from "@/hooks/use-shortcuts";
import type { DivineName } from "@/lib/content/names";
import { cn } from "@/lib/cn";
import {
  REVIEW_RATINGS,
  type RatingPreview,
  type ReviewRating,
} from "@/lib/srs/types";
import { Explanation } from "./explanation";
import { NameDisplay } from "./name-display";
import { Ornament } from "./ornament";
import { RatingControls } from "./rating-controls";
import {
  SessionFrame,
  sessionCardClass,
  type SessionFrameProps,
} from "./session-frame";

interface RecallStepProps {
  name: DivineName;
  frame: Omit<SessionFrameProps, "children" | "footer">;
  showTransliteration: boolean;
  preview: RatingPreview | null;
  now: Date;
  busy: boolean;
  onRate: (rating: ReviewRating) => void;
}

/** Active recall: attempt the meaning, reveal it, then rate the recall. */
export function RecallStep({
  name,
  frame,
  showTransliteration,
  preview,
  now,
  busy,
  onRate,
}: RecallStepProps) {
  const [revealed, setRevealed] = useState(false);
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => cardRef.current?.focus({ preventScroll: true }), [revealed]);

  const shortcuts = useMemo(() => {
    const map: Record<string, () => void> = {};
    if (!revealed) {
      map.Enter = map[" "] = () => setRevealed(true);
    } else {
      REVIEW_RATINGS.forEach((rating, i) => {
        map[String(i + 1)] = () => onRate(rating);
      });
    }
    return map;
  }, [revealed, onRate]);
  useShortcuts(shortcuts, !busy);

  return (
    <SessionFrame
      {...frame}
      footer={
        revealed ? (
          <RatingControls
            preview={preview}
            now={now}
            onRate={onRate}
            disabled={busy}
          />
        ) : (
          <div>
            <Button size="lg" block onClick={() => setRevealed(true)}>
              Reveal meaning
            </Button>
            <p className="mt-3 text-center text-xs text-ink-3">
              Try to recall it before you reveal.
              <span className="hidden [@media(hover:hover)]:inline">
                {" "}
                Press Space to reveal.
              </span>
            </p>
          </div>
        )
      }
    >
      <article
        ref={cardRef}
        tabIndex={-1}
        aria-roledescription="recall card"
        className={cn(sessionCardClass, "animate-reveal")}
      >
        <NameDisplay
          as="h1"
          name={name}
          showTransliteration={showTransliteration}
        />
        <Ornament className="my-6" />
        {revealed ? (
          <div className="animate-reveal">
            <p className="font-serif text-[1.75rem] leading-[1.15] text-balance text-ink sm:text-[2rem]">
              {name.shortMeaning}
            </p>
            <div className="mt-6">
              <Explanation text={name.explanation} />
            </div>
          </div>
        ) : (
          <p className="py-2 font-serif text-xl text-ink-2 italic">
            What does this Name mean?
          </p>
        )}
      </article>
    </SessionFrame>
  );
}
