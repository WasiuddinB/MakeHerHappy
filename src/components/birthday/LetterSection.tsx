import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { BirthdayContent } from "@/content/types";
import { formatFullDate, toIsoDate } from "@/lib/date-utils";
import { LoveLetter } from "./LoveLetter";

export function LetterSection({
  content,
  chapter,
}: {
  content: BirthdayContent;
  chapter?: number;
}) {
  const { letter, date } = content;
  return (
    <Section
      id="letter"
      className="bg-[linear-gradient(180deg,var(--color-blush-100),var(--color-peach-50)_35%,var(--color-peach-100))] px-5 py-24 sm:py-32"
    >
      <SectionHeading
        section="letter"
        chapter={chapter}
        eyebrow={letter.eyebrow}
        title={letter.heading}
        intro={letter.intro}
      />
      <LoveLetter letter={letter} dateLabel={formatFullDate(date)} isoDate={toIsoDate(date)} />
    </Section>
  );
}
