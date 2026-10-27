import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { BirthdayContent } from "@/content/types";
import { SurpriseNotes } from "./SurpriseNotes";

export function NotesSection({ content, chapter }: { content: BirthdayContent; chapter?: number }) {
  const { notes } = content;
  return (
    <Section
      id="notes"
      className="bg-[linear-gradient(180deg,var(--color-blush-50),var(--color-blush-100)_45%,var(--color-blush-50))] px-5 py-24 sm:py-32"
    >
      <SectionHeading
        section="notes"
        chapter={chapter}
        eyebrow={notes.eyebrow}
        title={notes.heading}
        intro={notes.intro}
      />
      <SurpriseNotes notes={notes.notes} signOff={notes.signOff} />
    </Section>
  );
}
