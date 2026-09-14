import type { SVGProps } from "react";

/**
 * Points of an eight-pointed star (two overlapping squares, the khatam),
 * centred in a box of `size`. Shared by the brand mark and the progress mosaic.
 */
export function starPoints(size: number, inset = 0): string {
  const c = size / 2;
  const outer = c - inset;
  const inner = outer * (Math.SQRT1_2 / Math.cos(Math.PI / 8));
  const points: string[] = [];
  for (let i = 0; i < 16; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i * Math.PI) / 8 - Math.PI / 2;
    points.push(
      `${(c + r * Math.cos(a)).toFixed(3)},${(c + r * Math.sin(a)).toFixed(3)}`,
    );
  }
  return points.join(" ");
}

const MARK_POINTS = starPoints(24, 1.5);

/** Brand mark: an outlined eight-pointed star with a quiet centre. */
export function StarMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <polygon
        points={MARK_POINTS}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.4" fill="var(--gold)" />
    </svg>
  );
}
