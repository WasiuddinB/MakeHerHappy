"use client";

import { ArrowUp, Sparkles } from "lucide-react";
import { useRef, useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { FinaleContent } from "@/content/types";
import { between, seededRandom } from "@/lib/random";
import { scrollToSection } from "@/lib/scroll";

const random = seededRandom(7);
const SPARKS = Array.from({ length: 26 }, () => ({
  "--x": `${between(random, 2, 98).toFixed(1)}%`,
  "--size": `${between(random, 3, 7).toFixed(1)}px`,
  "--duration": `${between(random, 3.2, 5.6).toFixed(2)}s`,
  "--delay": `${between(random, 0.4, 2.6).toFixed(2)}s`,
  "--drift": `${Math.round(between(random, -60, 60))}px`,
})) as CSSProperties[];

/** Base delay (ms) for each step of the reveal, so it unfolds in order. */
const STEP = { title: 250, dedication: 900, gap: 500 };

export function FinalReveal({ finale, chapter }: { finale: FinaleContent; chapter?: number }) {
  const [revealed, setRevealed] = useState(false);
  const focusTitle = useRef(false);

  const reveal = () => {
    focusTitle.current = true;
    setRevealed(true);
  };

  const afterDedication = STEP.dedication + finale.dedication.length * STEP.gap;
  const at = (ms: number) => ({ animationDelay: `${ms}ms` });

  return (
    <div className="relative text-center" data-revealed={revealed}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {revealed &&
          SPARKS.map((style, index) => (
            <span key={index} className="gold-spark" style={style}>
              <svg viewBox="0 0 24 24" className="size-full" fill="#f5dca6">
                <path d="M12 0C13 8 16 11 24 12 16 13 13 16 12 24 11 16 8 13 0 12 8 11 11 8 12 0Z" />
              </svg>
            </span>
          ))}
      </div>

      <div className="mx-auto max-w-3xl">
        <SectionHeading
          section="finale"
          tone="dark"
          chapter={chapter}
          eyebrow={finale.eyebrow}
          title={finale.heading}
          intro={finale.intro}
        />

        {!revealed ? (
          <div className="mt-12">
            <Button variant="gold" size="lg" onClick={reveal}>
              <Sparkles className="size-5" aria-hidden="true" />
              {finale.buttonLabel}
            </Button>
          </div>
        ) : (
          <div className="mt-14">
            <span
              aria-hidden="true"
              className="mx-auto block h-px w-48 bg-[linear-gradient(90deg,transparent,var(--color-gold-300),transparent)] motion-safe:animate-[grow-line_1.2s_var(--ease-soft)_both]"
            />
            <h3
              ref={(node) => {
                if (node && focusTitle.current) {
                  focusTitle.current = false;
                  node.focus({ preventScroll: true });
                }
              }}
              tabIndex={-1}
              className="mt-10 pb-[0.1em] font-display text-[clamp(2.6rem,9vw,6.2rem)] italic leading-[1.02] text-gradient-gold outline-none drop-shadow-[0_0_28px_rgb(236_198_129/0.35)] motion-safe:animate-rise"
              style={at(STEP.title)}
            >
              {finale.title}
            </h3>

            <div className="mt-10 space-y-6 font-display text-xl leading-relaxed text-lavender-100 sm:text-2xl">
              {finale.dedication.map((paragraph, index) => (
                <p
                  key={index}
                  className="motion-safe:animate-rise"
                  style={at(STEP.dedication + index * STEP.gap)}
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {finale.promise && (
              <p
                className="mx-auto mt-12 max-w-2xl font-display text-2xl italic leading-snug text-gold-100 motion-safe:animate-rise sm:text-3xl"
                style={at(afterDedication)}
              >
                “{finale.promise}”
              </p>
            )}

            <p
              className="mt-12 font-hand text-4xl text-gold-200 motion-safe:animate-rise sm:text-5xl"
              style={at(afterDedication + STEP.gap)}
            >
              {finale.signature}
            </p>

            <div className="motion-safe:animate-fade" style={at(afterDedication + STEP.gap * 2.5)}>
              <p className="mt-12 text-lg text-lavender-200">{finale.closing}</p>
              <a
                href="#top"
                onClick={(event) => {
                  event.preventDefault();
                  scrollToSection("top");
                }}
                className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-[0.95rem] font-medium text-gold-100 ring-1 ring-gold-200/40 transition-colors hover:bg-white/10 hover:ring-gold-200/70"
              >
                <ArrowUp className="size-4" aria-hidden="true" />
                {finale.returnLabel}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
