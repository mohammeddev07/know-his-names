import { starPoints } from "@/components/ui/star";
import { cn } from "@/lib/cn";

const POINTS = starPoints(12);

/** A quiet divider between a Name and its meaning. */
export function Ornament({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("flex items-center justify-center gap-3", className)}
    >
      <span className="h-px w-10 bg-line-strong" />
      <svg viewBox="0 0 12 12" className="size-2.5 text-gold">
        <polygon points={POINTS} fill="currentColor" />
      </svg>
      <span className="h-px w-10 bg-line-strong" />
    </div>
  );
}
