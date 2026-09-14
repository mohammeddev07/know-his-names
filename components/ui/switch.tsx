"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

interface SwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Switch({
  label,
  description,
  checked,
  onChange,
  disabled,
}: SwitchProps) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <label
          htmlFor={id}
          className="block text-[0.9375rem] font-medium text-ink"
        >
          {label}
        </label>
        {description && (
          <p id={`${id}-desc`} className="mt-0.5 text-sm text-ink-2">
            {description}
          </p>
        )}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={description ? `${id}-desc` : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-11 w-[3.25rem] shrink-0 items-center rounded-full transition-colors duration-200 ease-calm disabled:opacity-50",
          "before:absolute before:inset-x-0 before:inset-y-[0.4rem] before:rounded-full before:transition-colors before:duration-200",
          checked ? "before:bg-primary" : "before:bg-line-strong",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "relative ml-1 size-6 rounded-full bg-[#fffdf8] shadow-[0_1px_3px_rgb(0_0_0/0.25)] transition-transform duration-200 ease-calm",
            checked && "translate-x-5",
          )}
        />
      </button>
    </div>
  );
}
