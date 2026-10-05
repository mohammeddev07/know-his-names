"use client";

import { SegmentedControl } from "@/components/ui/segmented-control";
import type { ReviewMode } from "@/lib/learning/types";

export const REVIEW_MODE_OPTIONS: { value: ReviewMode; label: string }[] = [
  { value: "meaning", label: "Meaning" },
  { value: "name", label: "Name" },
  { value: "mixed", label: "Mixed" },
];

interface ModePickerProps {
  value: ReviewMode;
  onChange: (mode: ReviewMode) => void;
  disabled?: boolean;
}

/** Chooses what a review practises: the meaning, the Name, or both. */
export function ModePicker({ value, onChange, disabled }: ModePickerProps) {
  return (
    <div data-mode-picker>
      <SegmentedControl
        legend="Practise"
        options={REVIEW_MODE_OPTIONS}
        value={value}
        onChange={(mode) => {
          onChange(mode);
          // Changing the mode re-plans the session and rebuilds the screen,
          // including this picker. Put focus back on the chosen mode once the
          // new screen is in place, so arrow keys and screen readers carry on.
          requestAnimationFrame(() =>
            document
              .querySelector<HTMLInputElement>(
                "[data-mode-picker] input:checked",
              )
              ?.focus(),
          );
        }}
        disabled={disabled}
      />
    </div>
  );
}
