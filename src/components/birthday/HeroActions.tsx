"use client";

import { BookOpen, Gift } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button, buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { prefersReducedMotion } from "@/lib/hooks";
import { scrollToSection } from "@/lib/scroll";
import type { SectionId } from "@/lib/sections";

interface HeroActionsProps {
  primaryLabel: string;
  secondaryLabel: string;
  /** Where "open your surprise" leads. */
  firstTarget: SectionId;
  /** Where "our little story" leads. */
  storyTarget: SectionId;
  className?: string;
}

export function HeroActions({
  primaryLabel,
  secondaryLabel,
  firstTarget,
  storyTarget,
  className,
}: HeroActionsProps) {
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => clearTimeout(timer));
  }, []);

  const openSurprise = () => {
    const hero = document.getElementById("top");
    timers.current.splice(0).forEach((timer) => clearTimeout(timer));

    if (!hero || prefersReducedMotion()) {
      scrollToSection(firstTarget);
      return;
    }

    // The constellation bursts open (CSS, keyed off data-opened), then we
    // glide on to the first surprise and quietly reset the hero behind us.
    hero.setAttribute("data-opened", "true");
    timers.current.push(
      window.setTimeout(() => scrollToSection(firstTarget), 700),
      window.setTimeout(() => hero.removeAttribute("data-opened"), 2600),
    );
  };

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row",
        className,
      )}
    >
      <Button size="lg" onClick={openSurprise} className="w-full max-w-xs sm:w-auto">
        <Gift className="size-5" aria-hidden="true" />
        {primaryLabel}
      </Button>
      <a
        href={`#${storyTarget}`}
        onClick={(event) => {
          event.preventDefault();
          scrollToSection(storyTarget);
        }}
        className={buttonClasses({
          variant: "secondary",
          size: "lg",
          className: "w-full max-w-xs sm:w-auto",
        })}
      >
        <BookOpen className="size-5" aria-hidden="true" />
        {secondaryLabel}
      </a>
    </div>
  );
}
