"use client";

import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { SurpriseChoice } from "@/content/types";
import { cn } from "@/lib/cn";

const TONES = ["bg-blush-100", "bg-peach-100", "bg-lavender-200"];

interface ChooseYourSurpriseProps {
  choices: SurpriseChoice[];
  backLabel: string;
  allDoneMessage: string;
}

export function ChooseYourSurprise({
  choices,
  backLabel,
  allDoneMessage,
}: ChooseYourSurpriseProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [visited, setVisited] = useState<ReadonlySet<string>>(() => new Set());
  const [bonusOpen, setBonusOpen] = useState(false);
  // What should receive focus once the next view has mounted.
  const focusTarget = useRef<string | null>(null);

  const selected = choices.find((choice) => choice.id === selectedId);
  const allVisited = choices.length > 0 && choices.every((choice) => visited.has(choice.id));

  const choose = (id: string) => {
    focusTarget.current = "panel";
    setBonusOpen(false);
    setSelectedId(id);
    setVisited((previous) => new Set(previous).add(id));
  };

  const goBack = () => {
    focusTarget.current = selectedId;
    setSelectedId(null);
  };

  const focusWhenReady = (key: string) => (node: HTMLElement | null) => {
    if (node && focusTarget.current === key) {
      focusTarget.current = null;
      node.focus({ preventScroll: true });
    }
  };

  // Each view is keyed, so switching remounts it and replays its entrance.
  return (
    <div className="mx-auto mt-12 max-w-4xl">
      {selected ? (
        <div
          key={selected.id}
          className="paper rounded-[2rem] px-6 py-10 text-center shadow-lift ring-1 ring-sand/70 motion-safe:animate-rise sm:px-14 sm:py-14"
        >
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-blush-100 text-rose-600">
            <Icon name={selected.icon} className="size-7" />
          </span>
          <h3
            ref={focusWhenReady("panel")}
            tabIndex={-1}
            className="mt-6 font-display text-[clamp(1.9rem,5vw,2.8rem)] leading-tight outline-none"
          >
            {selected.title}
          </h3>
          <p className="mx-auto mt-5 max-w-2xl font-display text-xl italic leading-relaxed text-ink sm:text-2xl">
            {selected.message}
          </p>

          {selected.bonus && (
            <div className="mt-8">
              <Button
                variant="secondary"
                aria-expanded={bonusOpen}
                aria-controls={`bonus-${selected.id}`}
                onClick={() => setBonusOpen((open) => !open)}
              >
                <Sparkles className="size-4" aria-hidden="true" />
                {selected.bonus.prompt}
              </Button>
              <div id={`bonus-${selected.id}`} aria-live="polite">
                {bonusOpen && (
                  <p className="mx-auto mt-6 max-w-xl rounded-2xl bg-blush-50 px-6 py-4 font-hand text-2xl leading-snug text-rose-700 motion-safe:animate-pop sm:text-3xl">
                    {selected.bonus.reveal}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="mt-10">
            <Button variant="ghost" onClick={goBack}>
              <ArrowLeft className="size-4" aria-hidden="true" />
              {backLabel}
            </Button>
          </div>
        </div>
      ) : (
        <div key="choices" className="motion-safe:animate-rise">
          <ul className="grid gap-4 sm:grid-cols-3 sm:gap-6">
            {choices.map((choice, index) => (
              <li key={choice.id}>
                <button
                  ref={focusWhenReady(choice.id)}
                  type="button"
                  onClick={() => choose(choice.id)}
                  className={cn(
                    "group relative flex h-full w-full flex-col items-center rounded-[1.75rem] px-6 py-8 text-center shadow-paper ring-1 ring-ink/5 transition-[translate,box-shadow] duration-500 ease-soft hover:-translate-y-1 hover:shadow-lift",
                    TONES[index % TONES.length],
                  )}
                >
                  <span className="grid size-16 place-items-center rounded-full bg-paper text-rose-600 shadow-paper transition-transform duration-500 ease-soft group-hover:rotate-6 group-hover:scale-110">
                    <Icon name={choice.icon} className="size-7" />
                  </span>
                  <span className="mt-5 font-display text-2xl text-ink">{choice.label}</span>
                  <span className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {choice.teaser}
                  </span>
                  {visited.has(choice.id) && (
                    <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-paper px-2.5 py-1 text-xs font-semibold text-rose-700">
                      <Check className="size-3" aria-hidden="true" />
                      Opened
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
          {allVisited && (
            <p className="mt-10 text-center font-hand text-2xl text-rose-700 motion-safe:animate-fade sm:text-3xl">
              {allDoneMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
