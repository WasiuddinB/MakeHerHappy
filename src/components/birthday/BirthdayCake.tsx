"use client";

import { RotateCcw, Wind } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import type { CakeContent } from "@/content/types";
import { cn } from "@/lib/cn";
import { useConfetti } from "@/lib/confetti";
import { prefersReducedMotion } from "@/lib/hooks";
import { between, seededRandom } from "@/lib/random";

/* Cake artwork lives in a 320×300 coordinate space; candles are HTML
 * buttons positioned over it in percentages so they stay real, focusable
 * controls at every size. */
const VIEW_W = 320;
const VIEW_H = 300;
const CANDLE_ZONE = { left: 100, right: 220, top: 34, bottom: 110 };
const CANDLE_STRIPES = [
  ["#f3cfc6", "#d48a8f"],
  ["#ddd0f0", "#c4b1e2"],
  ["#fbe4d3", "#ecc681"],
];

const random = seededRandom(91126);
const SPRINKLES = Array.from({ length: 26 }, (_, index) => {
  const onTop = index < 10;
  return {
    x: onTop ? between(random, 96, 224) : between(random, 56, 264),
    y: onTop ? between(random, 134, 170) : between(random, 206, 236),
    rotate: Math.round(between(random, 0, 180)),
    color: ["#d48a8f", "#c4b1e2", "#ecc681", "#fffcf7", "#bd6b78"][index % 5],
  };
});

const BLOW_STEP_MS = 140;
const MAX_CANDLES = 9;

export function BirthdayCake({ cake }: { cake: CakeContent }) {
  const count = Math.min(Math.max(Math.round(cake.candles), 1), MAX_CANDLES);
  const [lit, setLit] = useState<boolean[]>(() => Array<boolean>(count).fill(true));
  const [celebrating, setCelebrating] = useState(false);
  const celebrated = useRef(false);
  const timers = useRef<number[]>([]);
  const cakeRef = useRef<HTMLDivElement>(null);
  const focusTarget = useRef<"message" | "blow" | null>(null);
  const burst = useConfetti();

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => clearTimeout(timer));
  }, []);

  const clearTimers = () => timers.current.splice(0).forEach((timer) => clearTimeout(timer));

  const celebrate = () => {
    if (celebrated.current) return;
    celebrated.current = true;
    focusTarget.current = "message";
    setCelebrating(true);
    const rect = cakeRef.current?.getBoundingClientRect();
    if (rect) {
      burst({
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height * 0.2) / window.innerHeight,
        },
        count: window.innerWidth < 640 ? 70 : 110,
      });
    }
  };

  const blowOne = (index: number) => {
    if (!lit[index] || celebrated.current) return;
    const next = lit.map((isLit, candle) => (candle === index ? false : isLit));
    setLit(next);
    if (next.every((isLit) => !isLit)) celebrate();
  };

  const blowAll = () => {
    clearTimers();
    const remaining = lit.flatMap((isLit, index) => (isLit ? [index] : []));
    if (remaining.length === 0) return;

    if (prefersReducedMotion()) {
      setLit(lit.map(() => false));
      celebrate();
      return;
    }
    // A quick left-to-right "whoosh", then the celebration.
    remaining.forEach((candle, step) => {
      timers.current.push(
        window.setTimeout(
          () =>
            setLit((previous) =>
              previous.map((isLit, index) => (index === candle ? false : isLit)),
            ),
          step * BLOW_STEP_MS,
        ),
      );
    });
    timers.current.push(window.setTimeout(celebrate, remaining.length * BLOW_STEP_MS + 300));
  };

  const relight = () => {
    clearTimers();
    celebrated.current = false;
    focusTarget.current = "blow";
    setCelebrating(false);
    setLit(Array<boolean>(count).fill(true));
  };

  const focusWhenReady = (key: "message" | "blow") => (node: HTMLElement | null) => {
    if (node && focusTarget.current === key) {
      focusTarget.current = null;
      node.focus({ preventScroll: true });
    }
  };

  const litCount = lit.filter(Boolean).length;
  const spacing = (CANDLE_ZONE.right - CANDLE_ZONE.left) / count;

  return (
    <div className="mx-auto mt-10 flex max-w-xl flex-col items-center text-center">
      <div ref={cakeRef} className="@container relative w-full max-w-[22rem] sm:max-w-[26rem]">
        <CakeArtwork />
        <ul aria-label="Candles" className="absolute inset-0">
          {lit.map((isLit, index) => {
            const x = CANDLE_ZONE.left + spacing * (index + 0.5);
            const [light, dark] = CANDLE_STRIPES[index % CANDLE_STRIPES.length];
            return (
              <li
                key={index}
                className="absolute"
                style={{
                  left: `${((x - spacing / 2) / VIEW_W) * 100}%`,
                  width: `${(spacing / VIEW_W) * 100}%`,
                  top: `${(CANDLE_ZONE.top / VIEW_H) * 100}%`,
                  height: `${((CANDLE_ZONE.bottom - CANDLE_ZONE.top) / VIEW_H) * 100}%`,
                }}
              >
                <button
                  type="button"
                  data-lit={isLit}
                  aria-disabled={!isLit}
                  aria-label={`Candle ${index + 1} of ${count}${isLit ? "" : ", blown out"}`}
                  onClick={() => blowOne(index)}
                  className="absolute inset-0 flex items-end justify-center rounded-lg text-[length:3.3cqw]"
                >
                  <span
                    aria-hidden="true"
                    className="relative block h-[52%] w-[0.75em] rounded-t-sm shadow-[inset_-2px_0_0_rgb(0_0_0/0.06)]"
                    style={
                      {
                        backgroundImage: `repeating-linear-gradient(135deg, ${light} 0 6px, ${dark} 6px 10px)`,
                        "--flicker-delay": `${index * 170}ms`,
                      } as CSSProperties
                    }
                  >
                    <span className="absolute bottom-full left-1/2 h-[0.45em] w-px -translate-x-1/2 bg-ink/60" />
                    <span className="flame mb-[0.4em]" />
                    <span className="smoke mb-[0.5em]" />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="sr-only" aria-live="polite">
        {celebrating
          ? `All the candles are out. ${cake.celebrationTitle}`
          : `${litCount} of ${count} candles lit`}
      </p>

      {celebrating ? (
        <div className="mt-8 flex flex-col items-center motion-safe:animate-pop">
          <h3
            ref={focusWhenReady("message")}
            tabIndex={-1}
            className="font-display text-[clamp(1.8rem,5vw,2.6rem)] leading-tight text-ink outline-none"
          >
            {cake.celebrationTitle}
          </h3>
          <p className="mt-4 max-w-lg text-lg leading-relaxed text-ink-soft">
            {cake.celebrationMessage}
          </p>
          <Button variant="secondary" className="mt-7" onClick={relight}>
            <RotateCcw className="size-4" aria-hidden="true" />
            {cake.relightLabel}
          </Button>
        </div>
      ) : (
        <div className="mt-8 flex flex-col items-center">
          <Button ref={focusWhenReady("blow")} size="lg" onClick={blowAll}>
            <Wind className="size-5" aria-hidden="true" />
            {cake.blowLabel}
          </Button>
          <p className="mt-3 text-sm text-ink-soft">{cake.hint}</p>
        </div>
      )}
    </div>
  );
}

function CakeArtwork() {
  const drips = (xs: number[], y: number, color: string, lengths: number[]) =>
    xs.map((x, index) => (
      <path
        key={x}
        d={`M${x - 7} ${y}v${lengths[index % lengths.length]}a7 7 0 0 0 14 0v-${lengths[index % lengths.length]}z`}
        fill={color}
      />
    ));

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      aria-hidden="true"
      className={cn("block w-full overflow-visible")}
    >
      <ellipse cx="160" cy="284" rx="140" ry="10" fill="rgb(59 38 49 / 0.08)" />
      <ellipse cx="160" cy="276" rx="150" ry="14" fill="#fffcf7" stroke="#ead9c4" strokeWidth="2" />

      {/* bottom tier */}
      <rect x="42" y="178" width="236" height="96" rx="16" fill="#f3cfc6" />
      <rect x="42" y="178" width="236" height="20" rx="10" fill="#fffcf7" />
      {drips([62, 96, 128, 166, 204, 240, 262], 194, "#fffcf7", [10, 18, 8, 14, 20, 9])}
      {[62, 90, 118, 146, 174, 202, 230, 258].map((x) => (
        <circle key={x} cx={x} cy="258" r="4.2" fill="#fffcf7" opacity="0.9" />
      ))}
      <path
        d="M160 246s-12-7.4-15.4-14.7c-2.4-6 1.1-12.4 7.4-12.4 3.4 0 5.8 1.7 8 4.8 2.2-3.1 4.6-4.8 8-4.8 6.3 0 9.8 6.4 7.4 12.4-3.4 7.3-15.4 14.7-15.4 14.7Z"
        fill="#bd6b78"
      />

      {/* top tier */}
      <rect x="82" y="108" width="156" height="76" rx="14" fill="#f7cfb2" />
      <rect x="82" y="108" width="156" height="17" rx="8.5" fill="#fdf3f0" />
      {drips([100, 128, 160, 190, 220], 121, "#fdf3f0", [8, 14, 10, 16, 7])}

      {SPRINKLES.map((sprinkle, index) => (
        <rect
          key={index}
          x={sprinkle.x - 3.5}
          y={sprinkle.y - 1.25}
          width="7"
          height="2.5"
          rx="1.25"
          fill={sprinkle.color}
          transform={`rotate(${sprinkle.rotate} ${sprinkle.x} ${sprinkle.y})`}
        />
      ))}
    </svg>
  );
}
