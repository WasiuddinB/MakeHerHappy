import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { BirthdayContent } from "@/content/types";
import { AdorationCards } from "./AdorationCards";

export function AdoreSection({ content, chapter }: { content: BirthdayContent; chapter?: number }) {
  const { adore } = content;
  return (
    <Section
      id="adore"
      className="bg-[linear-gradient(180deg,var(--color-peach-100),var(--color-lavender-50)_28%,var(--color-lavender-100))] px-5 py-24 sm:py-32"
    >
      <SectionHeading
        section="adore"
        chapter={chapter}
        eyebrow={adore.eyebrow}
        title={adore.heading}
        intro={adore.intro}
      />
      <AdorationCards reasons={adore.reasons} />
    </Section>
  );
}
