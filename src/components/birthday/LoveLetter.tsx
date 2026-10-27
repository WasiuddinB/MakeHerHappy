"use client";

import { Heart, MailOpen, Undo2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { LetterContent } from "@/content/types";
import { prefersReducedMotion } from "@/lib/hooks";

type LetterState = "sealed" | "opening" | "open";

interface LoveLetterProps {
  letter: LetterContent;
  dateLabel: string;
  isoDate: string;
}

const OPENING_MS = 1100;

export function LoveLetter({ letter, dateLabel, isoDate }: LoveLetterProps) {
  const [state, setState] = useState<LetterState>("sealed");
  const envelopeRef = useRef<HTMLButtonElement>(null);
  const letterRef = useRef<HTMLElement>(null);
  const focusAfter = useRef<"letter" | "envelope" | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Move focus once the element it should land on actually exists.
  useEffect(() => {
    if (focusAfter.current === "letter" && state === "open") {
      letterRef.current?.focus({ preventScroll: true });
      focusAfter.current = null;
    } else if (focusAfter.current === "envelope" && state === "sealed") {
      envelopeRef.current?.focus({ preventScroll: true });
      envelopeRef.current?.scrollIntoView({
        block: "center",
        behavior: prefersReducedMotion() ? "instant" : "smooth",
      });
      focusAfter.current = null;
    }
  }, [state]);

  const open = () => {
    focusAfter.current = "letter";
    if (prefersReducedMotion()) {
      setState("open");
      return;
    }
    setState("opening");
    timer.current = window.setTimeout(() => setState("open"), OPENING_MS);
  };

  const fold = () => {
    focusAfter.current = "envelope";
    setState("sealed");
  };

  if (state !== "open") {
    return (
      <div className="mt-14 text-center">
        <button
          ref={envelopeRef}
          type="button"
          onClick={open}
          disabled={state === "opening"}
          data-state={state}
          className="group mx-auto block w-full max-w-md rounded-2xl"
        >
          <span
            aria-hidden="true"
            className="relative block aspect-[1.55] w-full perspective-[1400px]"
          >
            {/* inside of the envelope */}
            <span className="absolute inset-0 rounded-xl bg-blush-300 shadow-lift" />
            {/* the letter, peeking out once the flap opens */}
            <span className="letter-peek paper absolute inset-x-[7%] bottom-[8%] top-[6%] z-[1] rounded-md shadow-paper">
              <span className="block px-5 pt-4 text-left font-hand text-xl text-rose-700">
                {letter.greeting}
              </span>
              <span className="mx-5 mt-3 block h-px bg-sand" />
              <span className="mx-5 mt-4 block h-px bg-sand" />
              <span className="mx-5 mt-4 block h-px w-2/3 bg-sand" />
            </span>
            {/* front pocket */}
            <span className="absolute inset-0 z-[2] rounded-xl bg-blush-100 [clip-path:polygon(0_0,50%_54%,100%_0,100%_100%,0_100%)]" />
            <span className="absolute inset-0 z-[2] rounded-xl bg-[linear-gradient(to_top_right,transparent_49.5%,rgb(157_74_92/0.12)_50%,transparent_50.5%),linear-gradient(to_top_left,transparent_49.5%,rgb(157_74_92/0.12)_50%,transparent_50.5%)]" />
            <span className="absolute inset-x-0 bottom-[11%] z-[3] text-center font-hand text-2xl text-rose-700 sm:text-3xl">
              {letter.envelopeNote}
            </span>
            {/* flap */}
            <span className="envelope-flap absolute inset-x-0 top-0 z-[4] h-[56%] rounded-t-xl bg-blush-200 shadow-[0_2px_6px_-2px_rgb(61_15_32/0.25)]" />
            {/* wax seal */}
            <span className="wax-seal absolute left-1/2 top-[56%] z-[5] grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#94405a,#5c1a2f_72%)] text-gold-200 shadow-[0_8px_16px_-6px_rgb(61_15_32/0.7)] ring-4 ring-burgundy/15 transition-[scale,opacity] duration-300 ease-soft group-hover:scale-110 sm:size-20">
              <Heart className="size-6 fill-current sm:size-7" />
            </span>
          </span>
          <span className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full px-4 font-semibold text-rose-700 underline decoration-rose-400/50 underline-offset-4 transition-colors group-hover:decoration-rose-700">
            <MailOpen className="size-5" aria-hidden="true" />
            {letter.openLabel}
          </span>
        </button>
      </div>
    );
  }

  return (
    <article
      id="love-letter"
      ref={letterRef}
      tabIndex={-1}
      aria-labelledby="love-letter-greeting"
      className="paper relative mx-auto mt-14 max-w-2xl rounded-[1.75rem] px-6 py-12 shadow-lift outline-none ring-1 ring-sand/80 motion-safe:animate-[unfold_0.8s_var(--ease-soft)_both] sm:px-14 sm:py-16"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-3 rounded-[1.3rem] border border-rose-400/25"
      />
      <Heart
        aria-hidden="true"
        className="absolute right-7 top-7 size-6 rotate-12 fill-blush-200 text-rose-400 sm:right-10 sm:top-10"
      />

      <p className="font-display text-sm italic text-ink-soft">
        <time dateTime={isoDate}>{dateLabel}</time>
      </p>
      <h3 id="love-letter-greeting" className="mt-4 font-hand text-4xl text-rose-700 sm:text-5xl">
        {letter.greeting}
      </h3>

      <div className="mt-7 space-y-6 font-display text-[1.14rem] leading-[1.85] text-ink sm:text-[1.28rem]">
        {letter.paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className="motion-safe:animate-rise"
            style={{ animationDelay: `${350 + index * 160}ms` }}
          >
            {paragraph}
          </p>
        ))}
      </div>

      <p className="mt-10 font-hand text-3xl text-ink-soft">{letter.closing}</p>
      <p className="font-hand text-5xl text-rose-700">{letter.signature}</p>

      {letter.postscript && (
        <p className="mt-10 border-t border-dashed border-sand pt-6 font-hand text-2xl text-ink-soft">
          {letter.postscript}
        </p>
      )}

      <div className="mt-10 flex justify-center">
        <Button variant="ghost" size="sm" onClick={fold}>
          <Undo2 className="size-4" aria-hidden="true" />
          Fold the letter
        </Button>
      </div>
    </article>
  );
}
