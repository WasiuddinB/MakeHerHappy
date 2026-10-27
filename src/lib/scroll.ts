import { prefersReducedMotion } from "./hooks";

interface ScrollOptions {
  /** Move keyboard focus to the section heading (default true). */
  focus?: boolean;
  /** Override the scroll behaviour; defaults to smooth unless reduced motion. */
  behavior?: ScrollBehavior;
}

/**
 * Scrolls a section into view and, by default, moves focus to its heading
 * so keyboard and screen-reader users land in the same place visually and
 * logically.
 */
export function scrollToSection(id: string, { focus = true, behavior }: ScrollOptions = {}) {
  const section = document.getElementById(id);
  if (!section) return;

  section.scrollIntoView({
    // "auto" would inherit the page's CSS smooth scrolling, so jumps are "instant".
    behavior: behavior ?? (prefersReducedMotion() ? "instant" : "smooth"),
    block: "start",
  });

  if (focus) {
    const target = section.querySelector<HTMLElement>("[data-section-heading]") ?? section;
    target.focus({ preventScroll: true });
  }
}

export interface ScrollAnchor {
  id: string;
  /** How far through the section the top of the viewport is, 0–1. */
  progress: number;
}

/** Remembers where the reader is within a section, before a layout change. */
export function captureScrollAnchor(id: string): ScrollAnchor | null {
  const section = document.getElementById(id);
  if (!section) return null;
  const rect = section.getBoundingClientRect();
  const progress = rect.height > 0 ? Math.min(Math.max(-rect.top / rect.height, 0), 1) : 0;
  return { id, progress };
}

/** Puts the reader back at the same relative point after a layout change. */
export function restoreScrollAnchor(anchor: ScrollAnchor) {
  const section = document.getElementById(anchor.id);
  if (!section) return;
  const top =
    section.getBoundingClientRect().top + window.scrollY + anchor.progress * section.offsetHeight;
  window.scrollTo({ top, behavior: "instant" });
}
