import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { BirthdayContent } from "@/content/types";
import { MemoryGallery } from "./MemoryGallery";

export function GallerySection({
  content,
  chapter,
}: {
  content: BirthdayContent;
  chapter?: number;
}) {
  const { gallery } = content;
  return (
    <Section
      id="gallery"
      className="bg-[radial-gradient(var(--color-sand)_1px,transparent_1.5px)] bg-cream bg-size-[22px_22px] px-4 py-24 sm:px-6 sm:py-32"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,var(--color-ivory),transparent_18%,transparent_82%,var(--color-blush-50))]"
      />
      <SectionHeading
        section="gallery"
        chapter={chapter}
        eyebrow={gallery.eyebrow}
        title={gallery.heading}
        intro={gallery.intro}
      />
      <MemoryGallery photos={gallery.photos} />
    </Section>
  );
}
