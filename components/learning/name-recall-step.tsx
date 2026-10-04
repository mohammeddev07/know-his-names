"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useShortcuts } from "@/hooks/use-shortcuts";
import type { DivineName } from "@/lib/content/names";
import { cn } from "@/lib/cn";
import { buildChoices, ratingForChoice } from "@/lib/learning/choices";
import type { NameAnswerStyle } from "@/lib/learning/types";
import {
  REVIEW_RATINGS,
  type RatingPreview,
  type ReviewRating,
} from "@/lib/srs/types";
import { Explanation } from "./explanation";
import { NameDisplay } from "./name-display";
import { Ornament } from "./ornament";
import { PairingNote } from "./pairing-note";
import { RatingControls } from "./rating-controls";
import {
  SessionFrame,
  sessionCardClass,
  type SessionFrameProps,
} from "./session-frame";

export interface NameRecallStepProps {
  name: DivineName;
  /** Names the learner has met; distractors are drawn from these. */
  introduced: readonly DivineName[];
  answerStyle: NameAnswerStyle;
  frame: Omit<SessionFrameProps, "children" | "footer">;
  showTransliteration: boolean;
  preview: RatingPreview | null;
  now: Date;
  busy: boolean;
  onRate: (rating: ReviewRating) => void;
}

/**
 * The Name card: the meaning is shown and the learner works out the Name,
 * either by choosing it or by recalling it and rating themselves. Choice
 * falls back to reveal when the learner has met too few Names to offer a
 * real choice. Mount one per step (key it): options are chosen once.
 */
export function NameRecallStep(props: NameRecallStepProps) {
  const [options] = useState(() =>
    props.answerStyle === "choice"
      ? buildChoices(props.name, props.introduced)
      : null,
  );
  return options ? (
    <ChoiceCard {...props} options={options} />
  ) : (
    <RevealCard {...props} />
  );
}

function Question({ name }: { name: DivineName }) {
  return (
    <>
      <p className="font-serif text-xl text-ink-2 italic">
        Which Name is this?
      </p>
      <h1 className="mt-4 font-serif text-[1.75rem] leading-[1.15] text-balance text-ink sm:text-[2rem]">
        {name.shortMeaning}
      </h1>
    </>
  );
}

function ChoiceCard({
  name,
  options,
  frame,
  showTransliteration,
  busy,
  onRate,
}: NameRecallStepProps & { options: DivineName[] }) {
  const [picked, setPicked] = useState<DivineName | null>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const correct = picked?.id === name.id;
  const feedback = correct
    ? "That's right."
    : `Not quite. This is ${name.transliteration}.`;

  // The options disable once answered, so move focus to Continue.
  useEffect(() => {
    if (picked) {
      footerRef.current
        ?.querySelector("button")
        ?.focus({ preventScroll: true });
    }
  }, [picked]);

  const choose = (option: DivineName) => {
    if (picked || busy) return;
    setPicked(option);
  };

  const shortcuts = useMemo(() => {
    const map: Record<string, () => void> = {};
    options.forEach((option, i) => {
      map[String(i + 1)] = () => {
        if (!picked && !busy) setPicked(option);
      };
    });
    return map;
  }, [options, picked, busy]);
  useShortcuts(shortcuts, !busy);

  return (
    <SessionFrame
      {...frame}
      status={picked ? feedback : frame.status}
      footer={
        picked ? (
          <div ref={footerRef}>
            <Button
              size="lg"
              block
              disabled={busy}
              onClick={() => onRate(ratingForChoice(correct))}
            >
              Continue
            </Button>
          </div>
        ) : (
          <p className="text-center text-xs text-ink-3">
            Choose the Name that matches this meaning.
          </p>
        )
      }
    >
      <article className={cn(sessionCardClass, "animate-reveal")}>
        <Question name={name} />
        <Ornament className="my-6" />
        <div
          role="group"
          aria-label="Choose the Name"
          className="grid gap-3 text-center"
        >
          {options.map((option) => {
            const isAnswer = option.id === name.id;
            return (
              <button
                key={option.id}
                type="button"
                disabled={busy || picked !== null}
                onClick={() => choose(option)}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center rounded-2xl border px-4 py-3 transition-colors duration-200 ease-calm",
                  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus)",
                  !picked &&
                    "border-line bg-surface hover:border-line-strong hover:bg-surface-2",
                  picked &&
                    isAnswer &&
                    "border-primary bg-primary-soft text-primary-soft-ink",
                  picked &&
                    !isAnswer &&
                    option.id === picked.id &&
                    "border-danger bg-danger-soft text-danger",
                  picked &&
                    !isAnswer &&
                    option.id !== picked.id &&
                    "border-line bg-surface text-ink-3",
                )}
              >
                <span lang="ar" dir="rtl" className="text-arabic-md">
                  {option.arabic}
                </span>
                <span
                  className={cn(
                    "font-serif text-base italic",
                    !showTransliteration && "sr-only",
                  )}
                >
                  {option.transliteration}
                </span>
              </button>
            );
          })}
        </div>
        {picked && (
          <div className="mt-6 animate-reveal">
            {/* Announced through the frame's status region; shown here for sighted learners. */}
            <p
              aria-hidden="true"
              className={cn(
                "font-medium",
                correct ? "text-primary-soft-ink" : "text-danger",
              )}
            >
              {feedback}
            </p>
            <div className="mt-4">
              <Explanation text={name.explanation} />
              <PairingNote name={name} centered />
            </div>
          </div>
        )}
      </article>
    </SessionFrame>
  );
}

function RevealCard({
  name,
  frame,
  showTransliteration,
  preview,
  now,
  busy,
  onRate,
}: NameRecallStepProps) {
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
              Reveal Name
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
        <Question name={name} />
        <Ornament className="my-6" />
        {revealed ? (
          <div className="animate-reveal">
            <NameDisplay
              name={name}
              size="lg"
              showTransliteration={showTransliteration}
            />
            <div className="mt-6">
              <Explanation text={name.explanation} />
              <PairingNote name={name} centered />
            </div>
          </div>
        ) : (
          <p className="py-2 font-serif text-xl text-ink-2 italic">
            Can you recall the Name?
          </p>
        )}
      </article>
    </SessionFrame>
  );
}
