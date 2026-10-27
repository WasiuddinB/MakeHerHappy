import type { CSSProperties } from "react";
import { Sparkle } from "@/components/decor/Sparkle";
import { Section } from "@/components/layout/Section";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SmartImage } from "@/components/ui/SmartImage";
import type { BirthdayContent, Moment } from "@/content/types";
import { cn } from "@/lib/cn";

export function StorySection({ content, chapter }: { content: BirthdayContent; chapter?: number }) {
  const { story } = content;
  return (
    <Section id="story" className="bg-ivory px-5 py-24 sm:py-32">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(45%_30%_at_85%_10%,var(--color-blush-50),transparent_70%),radial-gradient(40%_30%_at_10%_60%,var(--color-peach-50),transparent_70%)]"
      />
      <SectionHeading
        section="story"
        chapter={chapter}
        eyebrow={story.eyebrow}
        title={story.heading}
        intro={story.intro}
      />

      <ol className="relative mx-auto mt-16 max-w-5xl before:absolute before:bottom-6 before:left-6 before:top-6 before:w-0.5 before:-translate-x-1/2 before:bg-[repeating-linear-gradient(to_bottom,var(--color-rose-400)_0_7px,transparent_7px_15px)] before:content-[''] lg:before:left-1/2">
        {story.moments.map((moment, index) => (
          <TimelineItem key={`${index}-${moment.title}`} moment={moment} index={index} />
        ))}
      </ol>

      <div
        aria-hidden="true"
        className="mx-auto mt-2 flex max-w-5xl justify-start pl-3 lg:justify-center lg:pl-0"
      >
        <Sparkle className="size-6 text-gold-300 motion-safe:animate-twinkle" />
      </div>
    </Section>
  );
}

function TimelineItem({ moment, index }: { moment: Moment; index: number }) {
  const flipped = index % 2 === 1;
  const chapter = String(index + 1).padStart(2, "0");

  return (
    <Reveal
      as="li"
      from={flipped ? "right" : "left"}
      className="relative grid pb-16 pl-16 last:pb-10 lg:grid-cols-[1fr_6rem_1fr] lg:items-center lg:pl-0"
    >
      {/* marker on the thread */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 grid size-12 place-items-center rounded-full bg-paper text-rose-600 shadow-paper ring-4 ring-ivory lg:static lg:col-start-2 lg:row-start-1 lg:justify-self-center"
      >
        <Icon name={moment.icon ?? "heart"} className="size-5" />
      </span>

      <div
        className={cn(
          "lg:row-start-1",
          flipped ? "lg:col-start-3 lg:pl-2" : "lg:col-start-1 lg:pr-2 lg:text-right",
        )}
      >
        {moment.when && <p className="font-hand text-2xl text-rose-700">{moment.when}</p>}
        <h3 className="mt-1 font-display text-[clamp(1.6rem,4vw,2.25rem)] leading-tight text-ink">
          {moment.title}
        </h3>
        <p className="mt-3 text-lg leading-relaxed text-ink-soft">{moment.description}</p>
      </div>

      <div
        className={cn(
          "lg:row-start-1",
          flipped ? "lg:col-start-1" : "lg:col-start-3",
          moment.photo ? "mt-6 lg:mt-0" : "hidden lg:block",
        )}
      >
        {moment.photo ? (
          <figure
            style={{ "--tilt": flipped ? "-2deg" : "2deg" } as CSSProperties}
            className="paper relative mx-auto w-full max-w-sm rotate-(--tilt) rounded-md p-3 pb-9 shadow-lift ring-1 ring-sand/70"
          >
            <span
              aria-hidden="true"
              className="absolute -top-3 left-1/2 z-10 h-6 w-24 -translate-x-1/2 -rotate-3 bg-peach-200/80 shadow-sm"
            />
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-cream">
              <SmartImage
                src={moment.photo.src}
                alt={moment.photo.alt}
                sizes="(min-width: 1024px) 24rem, 90vw"
                className="object-cover"
                style={{ objectPosition: moment.photo.focus ?? "50% 50%" }}
              />
            </div>
          </figure>
        ) : (
          <span
            aria-hidden="true"
            className={cn(
              "block select-none font-display text-[7rem] italic leading-none text-transparent [-webkit-text-stroke:1.5px_var(--color-blush-300)]",
              flipped ? "text-right" : "text-left",
            )}
          >
            {chapter}
          </span>
        )}
      </div>
    </Reveal>
  );
}
