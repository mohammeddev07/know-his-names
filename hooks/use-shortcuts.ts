"use client";

import { useEffect } from "react";

/**
 * Single-key shortcuts (e.g. Space to reveal, 1–4 to rate). Ignored while
 * typing, and Enter/Space are left to a focused button or link.
 */
export function useShortcuts(
  shortcuts: Record<string, () => void>,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat)
        return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']"))
        return;
      if (
        (event.key === "Enter" || event.key === " ") &&
        target?.closest("button, a, summary")
      ) {
        return;
      }
      const handler = shortcuts[event.key];
      if (handler) {
        event.preventDefault();
        handler();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shortcuts, enabled]);
}
