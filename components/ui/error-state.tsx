"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { StarMark } from "@/components/ui/star";

/**
 * Fallback for unexpected errors. It reassures rather than alarms, and never
 * shows technical details: the error goes to the console for debugging.
 */
export function ErrorState({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
      className="mx-auto flex min-h-[70dvh] max-w-md animate-rise flex-col items-center justify-center px-6 py-12 text-center"
    >
      <StarMark className="size-12 text-primary" />
      <h1 className="mt-6 font-serif text-[2rem] leading-tight text-ink">
        Something went wrong
      </h1>
      <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-2">
        This page couldn&apos;t be shown. Your progress is saved on this device
        and hasn&apos;t been affected.
      </p>
      <div className="mt-8 flex w-full flex-col gap-3">
        <Button size="lg" block onClick={retry}>
          Try again
        </Button>
        <ButtonLink href="/" variant="quiet" size="lg" block>
          Go to home
        </ButtonLink>
      </div>
    </div>
  );
}
