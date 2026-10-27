import type { BirthdayContent } from "@/content/types";

export type SectionId =
  | "top"
  | "countdown"
  | "letter"
  | "adore"
  | "story"
  | "gallery"
  | "notes"
  | "choose"
  | "cake"
  | "finale";

export interface SectionLink {
  id: SectionId;
  label: string;
  /** Chapter number shown in headings and menus; the cover has none. */
  chapter: number | null;
}

/**
 * The sections the page shows, in order. A section whose list is empty in
 * the content file (no reasons, no photos…) is left out entirely, so the
 * menu and presentation mode never point at something that isn't there.
 */
export function getSections(content: BirthdayContent): SectionLink[] {
  const candidates: Array<{ id: SectionId; label: string; visible: boolean }> = [
    { id: "top", label: "The beginning", visible: true },
    { id: "countdown", label: content.countdown.navLabel, visible: true },
    { id: "letter", label: content.letter.navLabel, visible: content.letter.paragraphs.length > 0 },
    { id: "adore", label: content.adore.navLabel, visible: content.adore.reasons.length > 0 },
    { id: "story", label: content.story.navLabel, visible: content.story.moments.length > 0 },
    { id: "gallery", label: content.gallery.navLabel, visible: content.gallery.photos.length > 0 },
    { id: "notes", label: content.notes.navLabel, visible: content.notes.notes.length > 0 },
    { id: "choose", label: content.choose.navLabel, visible: content.choose.choices.length > 0 },
    { id: "cake", label: content.cake.navLabel, visible: true },
    { id: "finale", label: content.finale.navLabel, visible: true },
  ];

  let chapter = 0;
  return candidates
    .filter((section) => section.visible)
    .map(({ id, label }) => ({ id, label, chapter: id === "top" ? null : ++chapter }));
}

export function getChapter(sections: SectionLink[], id: SectionId): number | undefined {
  return sections.find((section) => section.id === id)?.chapter ?? undefined;
}

/** id of the heading inside a section — used for aria-labelledby and focus. */
export function headingId(id: SectionId): string {
  return `${id}-title`;
}
