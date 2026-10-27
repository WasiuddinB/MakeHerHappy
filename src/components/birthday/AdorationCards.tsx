"use client";

import { ArrowRight, Heart, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { Reason } from "@/content/types";
import { cn } from "@/lib/cn";

/* A repeating rhythm of paper colours and tilts, so the cards feel laid out
 * by hand rather than stamped from a template — but identical every visit. */
const TONES = [
  { face: "bg-blush-100 text-ink", accent: "text-rose-700", badge: "bg-paper text-rose-600" },
  { face: "bg-peach-100 text-ink", accent: "text-rose-700", badge: "bg-paper text-rose-600" },
  { face: "bg-lavender-200 text-ink", accent: "text-lilac-600", badge: "bg-paper text-lilac-600" },
  { face: "paper text-ink", accent: "text-rose-700", badge: "bg-blush-100 text-rose-600" },
  { face: "bg-rose-700 text-paper", accent: "text-gold-100", badge: "bg-paper/15 text-gold-100" },
];
const TILTS = [-1.4, 1.1, -0.6, 1.6, -1, 0.7, -1.8];

interface AdorationCardsProps {
  reasons: Reason[];
}

export function AdorationCards({ reasons }: AdorationCardsProps) {
  const [flipped, setFlipped] = useState<ReadonlySet<number>>(() => new Set());
  const allFlipped = reasons.length > 0 && flipped.size === reasons.length;

  const toggle = (index: number) =>
    setFlipped((previous) => {
      const next = new Set(previous);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  return (
    <>
      <div className="mt-8 flex justify-center">
        <Button
          variant="secondary"
          size="sm"
          aria-pressed={allFlipped}
          onClick={() =>
            setFlipped(allFlipped ? new Set() : new Set(reasons.map((_, index) => index)))
          }
        >
          {allFlipped ? (
            <RotateCcw className="size-4" aria-hidden="true" />
          ) : (
            <Heart className="size-4" aria-hidden="true" />
          )}
          {allFlipped ? "Turn them all back" : "Reveal them all"}
        </Button>
      </div>

      <ul className="mx-auto mt-10 grid max-w-6xl grid-flow-dense gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
        {reasons.map((reason, index) => (
          <AdoreCard
            key={`${index}-${reason.title}`}
            reason={reason}
            index={index}
            flipped={flipped.has(index)}
            onToggle={() => toggle(index)}
          />
        ))}
      </ul>
    </>
  );
}

interface AdoreCardProps {
  reason: Reason;
  index: number;
  flipped: boolean;
  onToggle: () => void;
}

function AdoreCard({ reason, index, flipped, onToggle }: AdoreCardProps) {
  const frontButton = useRef<HTMLButtonElement>(null);
  const backButton = useRef<HTMLButtonElement>(null);
  const moveFocus = useRef(false);

  // When this card is turned by its own button, keep focus on the visible face.
  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    (flipped ? backButton : frontButton).current?.focus({ preventScroll: true });
  }, [flipped]);

  const turn = () => {
    moveFocus.current = true;
    onToggle();
  };

  const tone = TONES[index % TONES.length];
  const feature = index % 5 === 0;
  // Wide cards look skewed at the same angle, so they lean a little less.
  const tilt = TILTS[index % TILTS.length] * (feature ? 0.4 : 1);
  const number = String(index + 1).padStart(2, "0");
  const face = cn(
    "relative flex flex-col rounded-[1.75rem] p-6 shadow-paper ring-1 ring-ink/5 sm:p-7",
    feature ? "min-h-52 sm:min-h-64" : "min-h-44 sm:min-h-60",
    tone.face,
  );

  return (
    <li
      data-flipped={flipped}
      style={{ "--tilt": `${tilt}deg` } as CSSProperties}
      className={cn(
        "flip-card rotate-(--tilt) transition-[rotate,translate] duration-500 ease-soft focus-within:rotate-0 hover:-translate-y-1 hover:rotate-0",
        feature && "sm:col-span-2",
      )}
    >
      <div className="flip-card-inner">
        <div className={cn("flip-card-front", face)} inert={flipped}>
          <div className="flex items-start justify-between gap-4">
            {/* 80% keeps these large numerals above the 3:1 contrast minimum. */}
            <span
              className={cn("font-display text-5xl italic leading-none opacity-80", tone.accent)}
            >
              {number}
            </span>
            <span
              className={cn("grid size-12 shrink-0 place-items-center rounded-full", tone.badge)}
            >
              <Icon name={reason.icon ?? "heart"} className="size-5" />
            </span>
          </div>
          <h3
            className={cn(
              "mt-auto pt-6 font-display leading-tight sm:pt-8",
              feature ? "text-[clamp(1.9rem,4vw,2.6rem)]" : "text-[1.75rem]",
            )}
          >
            {reason.title}
          </h3>
          <button
            ref={frontButton}
            type="button"
            aria-label={`Read why: ${reason.title}`}
            onClick={turn}
            className={cn(
              "mt-4 inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold after:absolute after:inset-0 after:rounded-[1.75rem] after:content-['']",
              tone.accent,
            )}
          >
            Read why
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className={cn("flip-card-back", face)} inert={!flipped}>
          <p className={cn("eyebrow", tone.accent)}>{reason.title}</p>
          <p
            className={cn(
              "mt-4 font-display italic leading-relaxed",
              feature ? "text-[1.45rem] sm:text-[1.6rem]" : "text-[1.25rem]",
            )}
          >
            {reason.message}
          </p>
          <button
            ref={backButton}
            type="button"
            aria-label={`Turn back: ${reason.title}`}
            onClick={turn}
            className={cn(
              "mt-auto inline-flex min-h-11 items-center gap-2 self-start pt-4 text-sm font-semibold after:absolute after:inset-0 after:rounded-[1.75rem] after:content-['']",
              tone.accent,
            )}
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Turn back
          </button>
        </div>
      </div>
    </li>
  );
}
