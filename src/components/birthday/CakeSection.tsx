import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { BirthdayContent } from "@/content/types";
import { BirthdayCake } from "./BirthdayCake";

const BUNTING = ["#f3cfc6", "#ddd0f0", "#f7cfb2", "#e9b1a6", "#f5dca6"];

export function CakeSection({ content, chapter }: { content: BirthdayContent; chapter?: number }) {
  const { cake } = content;
  return (
    <Section
      id="cake"
      className="bg-[linear-gradient(180deg,var(--color-lavender-100),var(--color-peach-50)_30%,var(--color-cream))] px-5 pb-24 pt-28 sm:pb-32 sm:pt-36"
    >
      {/* bunting across the top */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1200 90"
        preserveAspectRatio="none"
        className="absolute inset-x-0 top-0 -z-10 h-16 w-full sm:h-20"
      >
        <path
          d="M0 8Q600 70 1200 8"
          fill="none"
          stroke="#bd6b78"
          strokeOpacity="0.4"
          strokeWidth="2"
        />
        {Array.from({ length: 15 }, (_, index) => {
          const x = 40 + index * 80;
          // Point on the quadratic curve above: y(t) = 8 + 2t(1 − t)(70 − 8).
          const t = x / 1200;
          const y = 8 + 124 * t * (1 - t);
          return (
            <path
              key={index}
              d={`M${x - 22} ${y - 2}L${x + 22} ${y - 2}L${x} ${y + 34}Z`}
              fill={BUNTING[index % BUNTING.length]}
            />
          );
        })}
      </svg>

      <SectionHeading
        section="cake"
        chapter={chapter}
        eyebrow={cake.eyebrow}
        title={cake.heading}
        intro={cake.intro}
      />
      <BirthdayCake cake={cake} />
    </Section>
  );
}
