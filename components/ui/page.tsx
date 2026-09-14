import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface PageProps {
  children: ReactNode;
  width?: "read" | "wide";
  className?: string;
}

/** Page content column. `read` suits focused content; `wide` suits lists. */
export function Page({ children, width = "read", className }: PageProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full animate-rise px-5 pt-6 pb-10 sm:px-8 sm:pt-10",
        width === "read" ? "max-w-2xl" : "max-w-5xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  children?: ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <header className="mb-8">
      <h1 className="font-serif text-[2rem] leading-[1.1] tracking-[-0.01em] text-ink sm:text-[2.5rem]">
        {title}
      </h1>
      {description && (
        <p className="mt-2 max-w-prose text-[0.9375rem] leading-relaxed text-ink-2">
          {description}
        </p>
      )}
      {children}
    </header>
  );
}

interface SectionProps {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Section({
  title,
  description,
  action,
  children,
  className,
}: SectionProps) {
  return (
    <section className={cn("mt-10", className)}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.01em] text-ink">
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-sm text-ink-2">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/** A raised surface for grouped content. */
export function Card({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "li";
}) {
  return (
    <Tag
      className={cn(
        "rounded-3xl border border-line bg-surface shadow-card",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
