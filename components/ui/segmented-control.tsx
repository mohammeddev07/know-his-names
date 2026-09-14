"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

interface Option<T extends string | number> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string | number> {
  legend: string;
  hideLegend?: boolean;
  options: ReadonlyArray<Option<T>>;
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}

/** A radio group styled as a segmented control. Arrow keys work natively. */
export function SegmentedControl<T extends string | number>({
  legend,
  hideLegend,
  options,
  value,
  onChange,
  disabled,
}: SegmentedControlProps<T>) {
  const name = useId();
  return (
    <fieldset disabled={disabled} className="min-w-0">
      <legend
        className={cn("mb-2 text-sm text-ink-2", hideLegend && "sr-only")}
      >
        {legend}
      </legend>
      <div className="flex rounded-2xl bg-surface-2 p-1">
        {options.map((option) => (
          <label key={String(option.value)} className="relative flex-1">
            <input
              type="radio"
              name={name}
              value={String(option.value)}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
              className="peer sr-only"
            />
            <span
              className={cn(
                "flex h-11 items-center justify-center rounded-xl px-2 text-sm font-medium text-ink-2 transition-[background-color,color,box-shadow] duration-200 ease-calm",
                "peer-checked:bg-surface peer-checked:text-ink peer-checked:shadow-card dark:peer-checked:bg-surface-3",
                "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--focus)",
                "hover:text-ink",
              )}
            >
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
