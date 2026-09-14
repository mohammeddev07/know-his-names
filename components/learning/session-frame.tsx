import { X } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/cn";

export interface SessionFrameProps {
  label: string;
  step: number;
  total: number;
  status?: string;
  error?: string | null;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Focus-mode frame for learning and review: exit, progress, the card, and the
 * primary action anchored within thumb reach on phones.
 */
export function SessionFrame({
  label,
  step,
  total,
  status,
  error,
  children,
  footer,
}: SessionFrameProps) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-4 pt-[max(env(safe-area-inset-top),0.5rem)] pb-[max(env(safe-area-inset-bottom),1rem)] sm:px-6">
      <div className="flex items-center gap-2 py-2">
        <Link
          href="/"
          aria-label="End session"
          className="-ml-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-ink-2 transition-colors duration-200 hover:bg-surface-2 hover:text-ink"
        >
          <X aria-hidden="true" className="size-5" />
        </Link>
        <ProgressBar
          value={step}
          max={total}
          label={`${label} progress`}
          className="flex-1"
        />
        <span className="w-14 shrink-0 text-right text-sm text-ink-2 tabular-nums">
          {Math.min(step + 1, total)}
          <span className="text-ink-3"> / {total}</span>
        </span>
      </div>
      <p
        role="status"
        aria-live="polite"
        className={cn(
          "min-h-5 text-center text-xs",
          error ? "font-medium text-danger" : "text-ink-3",
        )}
      >
        {error ?? status}
      </p>
      <div className="flex flex-1 flex-col md:justify-center">
        <div className="flex flex-1 flex-col justify-center py-4 md:flex-none">
          {children}
        </div>
        {footer && <div className="mt-auto pt-4 md:mt-4">{footer}</div>}
      </div>
    </div>
  );
}

/** Card surface shared by session steps. */
export const sessionCardClass =
  "rounded-[2rem] border border-line bg-surface px-6 pt-7 pb-8 text-center shadow-card outline-none sm:px-10 sm:pt-9 sm:pb-10";
