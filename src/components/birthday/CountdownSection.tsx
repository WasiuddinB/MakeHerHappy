import { Sparkle } from "@/components/decor/Sparkle";
import { Section } from "@/components/layout/Section";
import type { BirthdayContent } from "@/content/types";
import { formatFullDate, getBirthdayWindow } from "@/lib/date-utils";
import type { SectionId } from "@/lib/sections";
import { BirthdayCountdown } from "./BirthdayCountdown";

interface CountdownSectionProps {
  content: BirthdayContent;
  chapter?: number;
  cakeTarget: SectionId;
}

function getWindow({ date }: BirthdayContent) {
  try {
    return getBirthdayWindow(date, date.timeZone);
  } catch {
    throw new Error(
      `The time zone "${date.timeZone}" in src/content/birthday.ts isn't recognised. ` +
        `Use an IANA name such as "Asia/Dhaka" or "Europe/London".`,
    );
  }
}

export function CountdownSection({ content, chapter, cakeTarget }: CountdownSectionProps) {
  const { start, end } = getWindow(content);
  const zoneLabel = content.date.timeZone.split("/").at(-1)?.replaceAll("_", " ") ?? "local";

  return (
    <Section
      id="countdown"
      className="bg-[linear-gradient(180deg,var(--color-ivory),var(--color-blush-50)_40%,var(--color-blush-100))] px-5 py-24 sm:py-32"
    >
      <Sparkle className="absolute left-[8%] top-24 -z-10 size-8 text-gold-300 motion-safe:animate-twinkle" />
      <Sparkle className="absolute right-[10%] top-1/3 -z-10 size-5 text-rose-400 motion-safe:animate-twinkle motion-safe:[animation-delay:1.4s]" />
      <Sparkle className="absolute bottom-20 left-[18%] -z-10 size-4 text-lavender-300 motion-safe:animate-twinkle motion-safe:[animation-delay:0.7s]" />

      <div className="mx-auto max-w-4xl text-center">
        <BirthdayCountdown
          start={start}
          end={end}
          content={content.countdown}
          chapter={chapter}
          dateLabel={formatFullDate(content.date)}
          zoneLabel={zoneLabel}
          cakeTarget={cakeTarget}
        />
      </div>
    </Section>
  );
}
