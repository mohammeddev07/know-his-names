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
    <SegmentedControl
      legend="Practise"
      options={REVIEW_MODE_OPTIONS}
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
}
