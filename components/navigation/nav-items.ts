import { BookOpen, ChartNoAxesColumn, Compass, House } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/", label: "Home", icon: House },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/progress", label: "Progress", icon: ChartNoAxesColumn },
] as const;

/** Name detail pages belong to Explore. */
export function isNavItemActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  if (href === "/explore" && pathname.startsWith("/names/")) return true;
  return pathname === href || pathname.startsWith(`${href}/`);
}
