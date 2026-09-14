import { Info } from "lucide-react";

/**
 * Shows the reviewed explanation, or says plainly that none exists yet.
 * Explanations are never generated; they come only from content files.
 */
export function Explanation({ text }: { text?: string }) {
  if (text) {
    return (
      <p className="font-serif text-lg leading-relaxed text-pretty text-ink-2">
        {text}
      </p>
    );
  }
  return (
    <p className="mx-auto flex max-w-sm items-start gap-2.5 rounded-2xl bg-surface-2 px-4 py-3 text-left text-sm leading-relaxed text-ink-2">
      <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ink-3" />
      <span>A short explanation will be added once it has been reviewed.</span>
    </p>
  );
}
