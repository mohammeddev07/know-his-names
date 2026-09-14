"use client";

import { Search, X } from "lucide-react";
import { useId } from "react";

interface SearchFieldProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export function SearchField({
  label,
  placeholder,
  value,
  onChange,
}: SearchFieldProps) {
  const id = useId();
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-4 size-[1.125rem] -translate-y-1/2 text-ink-3"
      />
      <input
        id={id}
        type="search"
        inputMode="search"
        autoComplete="off"
        spellCheck={false}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full appearance-none rounded-2xl border border-line bg-surface pr-12 pl-11 text-base text-ink shadow-card transition-[border-color,box-shadow] duration-200 placeholder:text-ink-3 focus:border-primary/50 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus) [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute top-1/2 right-1 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-xl text-ink-3 hover:text-ink"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      )}
    </div>
  );
}
