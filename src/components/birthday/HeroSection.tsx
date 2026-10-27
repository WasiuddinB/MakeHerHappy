import { ChevronDown } from "lucide-react";
import { ConstellationHeart } from "@/components/decor/ConstellationHeart";
import { FloatingPetals } from "@/components/decor/FloatingPetals";
import { Section } from "@/components/layout/Section";
import type { BirthdayContent } from "@/content/types";
import { formatMonthDay, toIsoDate } from "@/lib/date-utils";
import { headingId, type SectionId } from "@/lib/sections";
import { HeroActions } from "./HeroActions";

interface HeroSectionProps {
  content: BirthdayContent;
  firstTarget: SectionId;
  storyTarget: SectionId;
}

export function HeroSection({ content, firstTarget, storyTarget }: HeroSectionProps) {
  const { hero, people, date } = content;

  return (
    <Section
      id="top"
      className="flex min-h-svh flex-col items-center justify-center bg-ivory px-5 pb-32 pt-[calc(var(--header-height)+2rem)] text-center"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-[radial-gradient(60%_45%_at_12%_8%,var(--color-peach-100),transparent_70%),radial-gradient(50%_45%_at_92%_88%,var(--color-lavender-100),transparent_72%),radial-gradient(65%_55%_at_50%_45%,var(--color-blush-50),transparent_80%)]"
      />
      <FloatingPetals />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center">
        <ConstellationHeart className="w-28 motion-safe:animate-fade sm:w-36" />

        <p className="eyebrow mt-8 flex flex-col items-center gap-1.5 text-rose-700 motion-safe:animate-rise sm:flex-row sm:gap-3">
          <time dateTime={toIsoDate(date)}>{formatMonthDay(date)}</time>
          <span aria-hidden="true" className="hidden sm:inline">
            ·
          </span>
          <span>{hero.eyebrow}</span>
        </p>

        {/* The headline is never faded in: it's the first thing she should see. */}
        <h1
          id={headingId("top")}
          tabIndex={-1}
          data-section-heading
          className="mt-6 outline-none motion-safe:animate-settle"
        >
          <span className="block font-display text-[clamp(1.6rem,4.6vw,2.6rem)] italic text-ink-soft">
            {hero.greeting}
          </span>
          <span className="mt-2 block wrap-break-word pb-[0.08em] font-display text-[clamp(3.3rem,14.5vw,9.5rem)] italic leading-[0.95] tracking-[-0.03em] text-gradient-rose">
            {people.her.name}
          </span>
        </h1>

        <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-soft motion-safe:animate-rise motion-safe:[animation-delay:300ms] sm:text-xl">
          {hero.subtitle}
        </p>

        <HeroActions
          primaryLabel={hero.primaryCta}
          secondaryLabel={hero.secondaryCta}
          firstTarget={firstTarget}
          storyTarget={storyTarget}
          className="mt-10 motion-safe:animate-rise motion-safe:[animation-delay:420ms]"
        />
      </div>

      <a
        href={`#${firstTarget}`}
        data-hide-in-presentation
        className="absolute bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] left-1/2 flex -translate-x-1/2 flex-col items-center whitespace-nowrap rounded-full px-4 py-1 font-hand text-xl text-rose-700"
      >
        {hero.scrollHint}
        <ChevronDown className="size-5 motion-safe:animate-bob" aria-hidden="true" />
      </a>
    </Section>
  );
}
