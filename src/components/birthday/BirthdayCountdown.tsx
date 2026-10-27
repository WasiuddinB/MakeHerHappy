"use client";

import { Cake, Heart } from "lucide-react";
import { Sparkle } from "@/components/decor/Sparkle";
import { buttonClasses } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { CountdownContent } from "@/content/types";
import { getBirthdayPhase, type DurationParts } from "@/lib/date-utils";
import { useNow } from "@/lib/hooks";

interface BirthdayCountdownProps {
  /** Birthday window as epoch milliseconds, computed on the server. */
  start: number;
  end: number;
  content: CountdownContent;
  chapter?: number;
  dateLabel: string;
  zoneLabel: string;
  /** Section id of the cake, for the "make a wish" shortcut. */
  cakeTarget: string;
}

export function BirthdayCountdown({
  start,
  end,
  content,
  chapter,
  dateLabel,
  zoneLabel,
  cakeTarget,
}: BirthdayCountdownProps) {
  // null on the server and during hydration: render a neutral state that is
  // true on any date, then switch to the live one.
  const now = useNow();
  const state = now === null ? null : getBirthdayPhase(now, { start, end });
  const message = state ? content[state.phase] : null;

  return (
    <>
      <SectionHeading
        section="countdown"
        chapter={chapter}
        eyebrow={dateLabel}
        title={message?.title ?? content.navLabel}
        intro={message?.message}
      />

      <div className="mt-12 flex min-h-56 flex-col items-center justify-center">
        {(state === null || state.phase === "upcoming") && (
          <>
            <CountdownTiles parts={state?.parts ?? null} />
            <p className="mt-5 text-sm text-ink-soft">
              Counting down to midnight, {zoneLabel} time.
            </p>
          </>
        )}

        {state?.phase === "birthday" && (
          <div className="flex flex-col items-center gap-8 motion-safe:animate-pop">
            <div className="relative grid size-36 place-items-center rounded-full bg-paper shadow-lift ring-1 ring-blush-200 sm:size-44">
              <Heart
                className="size-14 fill-rose-500 text-rose-600 motion-safe:animate-heartbeat sm:size-16"
                aria-hidden="true"
              />
              <Sparkle className="absolute -right-2 top-3 size-6 text-gold-300 motion-safe:animate-twinkle" />
              <Sparkle className="absolute -left-3 bottom-6 size-4 text-rose-400 motion-safe:animate-twinkle motion-safe:[animation-delay:1.2s]" />
            </div>
            <a href={`#${cakeTarget}`} className={buttonClasses()}>
              <Cake className="size-5" aria-hidden="true" />
              Make a birthday wish
            </a>
          </div>
        )}

        {state?.phase === "after" && (
          <div className="flex flex-col items-center gap-6 motion-safe:animate-fade">
            <Sparkle className="size-10 text-gold-300" />
            <a href={`#${cakeTarget}`} className={buttonClasses({ variant: "secondary" })}>
              <Cake className="size-5" aria-hidden="true" />
              Make a wish anyway
            </a>
          </div>
        )}
      </div>
    </>
  );
}

const UNITS = ["days", "hours", "minutes", "seconds"] as const;

function CountdownTiles({ parts }: { parts: DurationParts | null }) {
  return (
    <div role="timer" aria-busy={parts === null} className="w-full max-w-2xl">
      <dl className="grid grid-cols-4 gap-2 sm:gap-4">
        {UNITS.map((unit) => (
          <div
            key={unit}
            className="paper flex flex-col-reverse items-center rounded-2xl px-1 py-4 shadow-paper ring-1 ring-blush-200 sm:rounded-3xl sm:py-7"
          >
            <dt className="eyebrow mt-2 text-[0.62rem] tracking-[0.16em] text-ink-soft sm:text-xs">
              {unit}
            </dt>
            <dd className="font-display text-[clamp(1.9rem,8vw,4.5rem)] leading-none tabular-nums text-ink">
              {parts ? String(parts[unit]).padStart(2, "0") : "––"}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
