"use client";

import { Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { StarMark } from "@/components/ui/star";
import { cn } from "@/lib/cn";
import { NAV_ITEMS, isNavItemActive } from "./nav-items";

export function AppHeader() {
  const pathname = usePathname();
  const settingsActive = pathname === "/settings";

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-(--header-bg) pt-[env(safe-area-inset-top)] backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-3 sm:h-16 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-xl px-2 py-2 text-ink"
        >
          <StarMark className="size-6 text-primary" />
          <span className="font-serif text-[1.1875rem] leading-none tracking-[-0.01em]">
            Know His Names
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isNavItemActive(item.href, pathname);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-11 items-center rounded-full px-4 text-[0.9375rem] font-medium transition-colors duration-200",
                      active
                        ? "bg-primary-soft text-primary-soft-ink"
                        : "text-ink-2 hover:bg-surface-2 hover:text-ink",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <Link
          href="/settings"
          aria-label="Settings"
          aria-current={settingsActive ? "page" : undefined}
          className={cn(
            "inline-flex size-11 items-center justify-center rounded-full transition-colors duration-200",
            settingsActive
              ? "bg-primary-soft text-primary-soft-ink"
              : "text-ink-2 hover:bg-surface-2 hover:text-ink",
          )}
        >
          <Settings aria-hidden="true" className="size-5" strokeWidth={1.75} />
        </Link>
      </div>
    </header>
  );
}
