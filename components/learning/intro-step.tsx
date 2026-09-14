"use client";

import { useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useShortcuts } from "@/hooks/use-shortcuts";
import type { DivineName } from "@/lib/content/names";
import { cn } from "@/lib/cn";
import { Explanation } from "./explanation";
import { NameDisplay } from "./name-display";
import { Ornament } from "./ornament";
import {
  SessionFrame,
  sessionCardClass,
  type SessionFrameProps,
} from "./session-frame";

interface IntroStepProps {
  name: DivineName;
  frame: Omit<SessionFrameProps, "children" | "footer">;
  busy: boolean;
  onContinue: () => void;
}

/** First meeting with a Name: Arabic, transliteration, meaning, explanation. */
export function IntroStep({ name, frame, busy, onContinue }: IntroStepProps) {
  const cardRef = useRef<HTMLElement>(null);
  useEffect(() => cardRef.current?.focus({ preventScroll: true }), []);
  useShortcuts(
    useMemo(() => ({ Enter: onContinue, " ": onContinue }), [onContinue]),
    !busy,
  );

  return (
    <SessionFrame
      {...frame}
      footer={
        <Button size="lg" block onClick={onContinue} disabled={busy}>
          Continue
        </Button>
      }
    >
      <article
        ref={cardRef}
        tabIndex={-1}
        aria-roledescription="new Name"
        className={cn(sessionCardClass, "animate-reveal")}
      >
        <p className="inline-flex rounded-full bg-gold-soft px-3 py-1 text-xs font-medium text-gold-ink">
          New Name
        </p>
        <NameDisplay as="h1" name={name} className="mt-5" />
        <Ornament className="my-6" />
        <p className="font-serif text-[1.75rem] leading-[1.15] text-balance text-ink sm:text-[2rem]">
          {name.shortMeaning}
        </p>
        <div className="mt-6">
          <Explanation text={name.explanation} />
        </div>
      </article>
    </SessionFrame>
  );
}
