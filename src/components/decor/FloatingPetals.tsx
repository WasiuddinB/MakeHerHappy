import type { CSSProperties } from "react";
import { between, seededRandom } from "@/lib/random";

const SHAPES = {
  petal: "M12 1.5C18.5 6 20.5 14 12 22.5 3.5 14 5.5 6 12 1.5Z",
  heart:
    "M12 21s-7.5-4.6-9.6-9.2C.9 8 3.1 4 7 4c2.1 0 3.6 1.1 5 3 1.4-1.9 2.9-3 5-3 3.9 0 6.1 4 4.6 7.8C19.5 16.4 12 21 12 21Z",
  sparkle: "M12 0C13 8 16 11 24 12 16 13 13 16 12 24 11 16 8 13 0 12 8 11 11 8 12 0Z",
} as const;

const COLORS = ["#e9b1a6", "#f0b48f", "#d48a8f", "#c4b1e2", "#ecc681", "#f3cfc6"];
const KINDS: Array<keyof typeof SHAPES> = ["petal", "petal", "heart", "petal", "sparkle"];

// Generated once, deterministically — identical on every render and visit.
const random = seededRandom(20261109);
const PETALS = Array.from({ length: 16 }, (_, index) => {
  const kind = KINDS[index % KINDS.length];
  return {
    kind,
    color: COLORS[index % COLORS.length],
    style: {
      "--x": `${((index * 6.4 + between(random, 0, 5)) % 98).toFixed(1)}%`,
      "--size": `${Math.round(between(random, kind === "sparkle" ? 9 : 12, kind === "sparkle" ? 15 : 24))}px`,
      "--duration": `${between(random, 16, 28).toFixed(1)}s`,
      "--delay": `${(-between(random, 0, 26)).toFixed(1)}s`,
      "--drift": `${Math.round(between(random, -110, 110))}px`,
      "--spin-start": `${Math.round(between(random, 0, 360))}deg`,
      "--spin-end": `${Math.round(between(random, 360, 900))}deg`,
      "--rest-y": `${Math.round(between(random, 8, 88))}%`,
      "--opacity": between(random, 0.45, 0.85).toFixed(2),
    } as CSSProperties,
  };
});

/** Petals, hearts and sparkles drifting down behind the hero. Pure CSS. */
export function FloatingPetals() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {PETALS.map((petal, index) => (
        <span key={index} className="petal" style={petal.style}>
          <svg viewBox="0 0 24 24" className="size-full" fill={petal.color}>
            <path d={SHAPES[petal.kind]} />
          </svg>
        </span>
      ))}
    </div>
  );
}
