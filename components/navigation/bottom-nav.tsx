"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { NAV_ITEMS, isNavItemActive } from "./nav-items";

/** Thumb-reachable primary navigation for small screens. */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-(--header-bg) pb-[env(safe-area-inset-bottom)] backdrop-blur-xl backdrop-saturate-150 md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4 px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isNavItemActive(href, pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors duration-200",
                  active ? "text-ink" : "text-ink-3 hover:text-ink-2",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-14 items-center justify-center rounded-full transition-[background-color,color] duration-200 ease-calm",
                    active && "bg-primary-soft text-primary-soft-ink",
                  )}
                >
                  <Icon
                    aria-hidden="true"
                    className="size-[1.3rem]"
                    strokeWidth={active ? 2 : 1.75}
                  />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
