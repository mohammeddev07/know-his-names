import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "quiet" | "hero";
type Size = "sm" | "md" | "lg";

interface StyleProps {
  variant?: Variant;
  size?: Size;
  block?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap select-none " +
  "transition-[background-color,color,border-color,box-shadow,transform] duration-200 ease-calm " +
  "active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50 " +
  "aria-disabled:pointer-events-none aria-disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-ink shadow-raised hover:bg-primary-hover",
  secondary:
    "bg-surface text-ink border border-line-strong hover:bg-surface-2 hover:border-ink-3/40",
  ghost: "text-primary-soft-ink hover:bg-primary-soft",
  quiet: "text-ink-2 hover:text-ink hover:bg-surface-2",
  /** For use on the emerald hero surface. */
  hero: "bg-hero-button text-hero-button-ink hover:bg-hero-button/90",
};

const sizes: Record<Size, string> = {
  sm: "h-11 rounded-xl px-4 text-sm",
  md: "h-12 rounded-xl px-5 text-[0.9375rem]",
  lg: "h-14 rounded-2xl px-6 text-base font-semibold tracking-[-0.005em]",
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  block,
}: StyleProps = {}) {
  return cn(base, variants[variant], sizes[size], block && "w-full");
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & StyleProps;

export function Button({
  variant,
  size,
  block,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonStyles({ variant, size, block }), className)}
      {...props}
    />
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & StyleProps;

export function ButtonLink({
  variant,
  size,
  block,
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(buttonStyles({ variant, size, block }), className)}
      {...props}
    />
  );
}

/** Square 44px icon-only button. Always pass an aria-label. */
export function IconButton({
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { "aria-label": string }) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-full text-ink-2 transition-colors duration-200 hover:bg-surface-2 hover:text-ink",
        className,
      )}
      {...props}
    />
  );
}
