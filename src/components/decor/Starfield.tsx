import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { between, seededRandom } from "@/lib/random";

const random = seededRandom(1109);
const STARS = Array.from({ length: 72 }, (_, index) => ({
  twinkles: index % 3 === 0,
  style: {
    left: `${between(random, 0, 100).toFixed(2)}%`,
    top: `${between(random, 0, 100).toFixed(2)}%`,
    width: `${between(random, 1, 2.6).toFixed(1)}px`,
    opacity: between(random, 0.35, 0.9).toFixed(2),
    animationDelay: `${between(random, 0, 4).toFixed(2)}s`,
    animationDuration: `${between(random, 2.6, 5).toFixed(2)}s`,
  } as CSSProperties,
}));

/** A quiet field of stars for the night-time sections. Pure CSS. */
export function Starfield({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 -z-10", className)}>
      {STARS.map((star, index) => (
        <span
          key={index}
          style={star.style}
          className={cn(
            "absolute aspect-square rounded-full bg-gold-100",
            star.twinkles && "motion-safe:animate-twinkle",
          )}
        />
      ))}
    </div>
  );
}
