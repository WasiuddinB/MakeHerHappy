import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { BirthdayContent } from "@/content/types";
import { ChooseYourSurprise } from "./ChooseYourSurprise";

export function ChooseSection({
  content,
  chapter,
}: {
  content: BirthdayContent;
  chapter?: number;
}) {
  const { choose } = content;
  return (
    <Section
      id="choose"
      className="bg-[linear-gradient(180deg,var(--color-blush-50),var(--color-lavender-50)_35%,var(--color-lavender-100))] px-5 py-24 sm:py-32"
    >
      <div
        aria-hidden="true"
        className="absolute -left-24 top-24 -z-10 size-72 rounded-full bg-peach-100/70 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -right-20 bottom-10 -z-10 size-80 rounded-full bg-lavender-200/60 blur-3xl"
      />
      <SectionHeading
        section="choose"
        chapter={chapter}
        eyebrow={choose.eyebrow}
        title={choose.heading}
        intro={choose.intro}
      />
      <ChooseYourSurprise
        choices={choose.choices}
        backLabel={choose.backLabel}
        allDoneMessage={choose.allDoneMessage}
      />
    </Section>
  );
}
