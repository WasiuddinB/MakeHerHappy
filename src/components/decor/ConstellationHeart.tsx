import type { CSSProperties } from "react";
import { sparklePath } from "./Sparkle";

/* Points sampled from the classic parametric heart curve, so the stars sit
 * on a real heart outline. (viewBox 0 0 200 190, centre ≈ 100,90) */
const STARS = [
  { x: 100, y: 52.5, r: 6 },
  { x: 142.3, y: 14.4, r: 5 },
  { x: 187.3, y: 50.7, r: 4.4 },
  { x: 156.6, y: 110.7, r: 5 },
  { x: 100, y: 173.5, r: 6.4 },
  { x: 43.4, y: 110.7, r: 5 },
  { x: 12.7, y: 50.7, r: 4.4 },
  { x: 57.7, y: 14.4, r: 5 },
];

const OUTLINE = `M${STARS.map((star) => `${star.x} ${star.y}`).join("L")}Z`;

const DUST = [
  { x: 78, y: 70, r: 2 },
  { x: 128, y: 62, r: 2.4 },
  { x: 100, y: 118, r: 2.2 },
  { x: 68, y: 140, r: 1.6 },
  { x: 136, y: 142, r: 1.8 },
  { x: 30, y: 168, r: 1.6 },
  { x: 176, y: 160, r: 2 },
];

/**
 * The hero motif: a little constellation in the shape of a heart. Its
 * lines draw themselves on load, and when the surprise is opened the stars
 * burst outwards (see `[data-opened]` in globals.css).
 */
export function ConstellationHeart({ className }: { className?: string }) {
  return (
    <svg viewBox="-10 -10 220 210" className={className} aria-hidden="true" overflow="visible">
      <defs>
        <radialGradient id="constellation-glow-fill">
          <stop offset="0%" stopColor="#fcf0d4" stopOpacity="1" />
          <stop offset="45%" stopColor="#f5dca6" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#f3cfc6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle
        className="constellation-glow [transform-box:fill-box]"
        cx="100"
        cy="92"
        r="60"
        fill="url(#constellation-glow-fill)"
      />
      <path
        className="constellation-line"
        d={OUTLINE}
        pathLength={1}
        fill="none"
        stroke="#bd6b78"
        strokeOpacity="0.55"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      {DUST.map((dot, index) => (
        // Burst and twinkle both use `transform`, so each gets its own element.
        <g
          key={`dust-${index}`}
          className="constellation-star"
          style={
            {
              "--burst-x": `${(dot.x - 100) * 1.2}px`,
              "--burst-y": `${(dot.y - 90) * 1.2}px`,
            } as CSSProperties
          }
        >
          <circle
            className="origin-center motion-safe:animate-twinkle [transform-box:fill-box]"
            style={{ animationDelay: `${index * 0.55}s` }}
            cx={dot.x}
            cy={dot.y}
            r={dot.r}
            fill="#d48a8f"
          />
        </g>
      ))}
      {STARS.map((star, index) => (
        <g key={`star-${index}`} transform={`translate(${star.x} ${star.y})`}>
          <g
            className="constellation-star"
            style={
              {
                "--burst-x": `${(star.x - 100) * 0.9}px`,
                "--burst-y": `${(star.y - 90) * 0.9}px`,
              } as CSSProperties
            }
          >
            <path
              d={sparklePath(star.r * 1.7)}
              fill={index % 2 === 0 ? "#9d4a5c" : "#bd6b78"}
              className="origin-center motion-safe:animate-twinkle [transform-box:fill-box]"
              style={{ animationDelay: `${index * 0.42}s` }}
            />
          </g>
        </g>
      ))}
    </svg>
  );
}
