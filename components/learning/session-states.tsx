import { X } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { StarMark } from "@/components/ui/star";

interface SessionMessageProps {
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
}

/** Full-screen message inside the focus layout: empty, complete, or error. */
export function SessionMessage({
  title,
  children,
  actions,
}: SessionMessageProps) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-4 pt-[max(env(safe-area-inset-top),0.5rem)] pb-[max(env(safe-area-inset-bottom),1rem)] sm:px-6">
      <div className="py-2">
        <Link
          href="/"
          aria-label="Close"
          className="-ml-2 inline-flex size-11 items-center justify-center rounded-full text-ink-2 transition-colors duration-200 hover:bg-surface-2 hover:text-ink"
        >
          <X aria-hidden="true" className="size-5" />
        </Link>
      </div>
      <div className="flex flex-1 flex-col md:justify-center">
        <div className="flex flex-1 animate-rise flex-col items-center justify-center py-8 text-center md:flex-none">
          <StarMark className="size-12 text-primary" />
          <h1 className="mt-6 font-serif text-[2.25rem] leading-[1.1] tracking-[-0.01em] text-balance text-ink">
            {title}
          </h1>
          {children && (
            <div className="mt-3 max-w-sm text-[0.9375rem] leading-relaxed text-ink-2">
              {children}
            </div>
          )}
        </div>
        {actions && (
          <div className="mt-auto flex flex-col gap-3 pt-4 md:mt-8">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export function SessionLoading() {
  return (
    <div
      className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-4 pt-3 sm:px-6"
      aria-busy="true"
    >
      <span className="sr-only" role="status">
        Loading your session
      </span>
      <div className="flex items-center gap-3 py-3">
        <div className="size-8 rounded-full bg-surface-2" />
        <div className="h-1.5 flex-1 rounded-full bg-surface-3" />
      </div>
      <div className="flex flex-1 items-center">
        <div className="h-96 w-full animate-pulse rounded-[2rem] bg-surface-2" />
      </div>
    </div>
  );
}
