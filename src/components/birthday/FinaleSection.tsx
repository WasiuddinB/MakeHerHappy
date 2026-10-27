import { Starfield } from "@/components/decor/Starfield";
import { Section } from "@/components/layout/Section";
import type { BirthdayContent } from "@/content/types";
import { FinalReveal } from "./FinalReveal";

export function FinaleSection({
  content,
  chapter,
}: {
  content: BirthdayContent;
  chapter?: number;
}) {
  return (
    <Section id="finale" tone="dark" className="bg-midnight px-5 py-28 text-paper sm:py-40">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-[radial-gradient(80%_55%_at_50%_0%,var(--color-midnight-700),transparent_70%),radial-gradient(70%_45%_at_50%_100%,rgb(92_26_47/0.75),transparent_75%)]"
      />
      <Starfield />
      <FinalReveal finale={content.finale} chapter={chapter} />
    </Section>
  );
}
