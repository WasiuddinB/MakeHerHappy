"use client";

import { Menu, Presentation, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import type { SectionId } from "@/lib/sections";
import { useExperience } from "./Experience";
import { MusicButton } from "./MusicButton";

export function SiteHeader({ brand }: { brand: string }) {
  const { goTo, enterPresentation } = useExperience();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [tucked, setTucked] = useState(false);

  // Solid background once scrolled; tuck away while scrolling down so phones
  // get the whole screen, and come back as soon as she scrolls up.
  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 24);
      if (Math.abs(y - lastY) > 8) {
        setTucked(y > lastY && y > 160);
        lastY = y;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <header
        data-hide-in-presentation
        className={cn(
          "fixed inset-x-0 top-0 z-40 pt-[env(safe-area-inset-top)] transition-[translate,background-color,box-shadow] duration-500 ease-soft focus-within:translate-y-0",
          tucked && !menuOpen ? "-translate-y-full" : "translate-y-0",
          scrolled
            ? "bg-ivory/85 shadow-[0_1px_0_rgb(59_38_49/0.08)] backdrop-blur-md"
            : "bg-transparent",
        )}
      >
        <div className="mx-auto flex h-[var(--header-height)] max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <a
            href="#top"
            onClick={(event) => {
              event.preventDefault();
              goTo("top");
            }}
            className="min-w-0 truncate rounded-full px-2 py-1 font-hand text-2xl text-rose-700 sm:text-[1.7rem]"
          >
            <span aria-hidden="true">✦ </span>
            {brand}
          </a>
          <div className="flex shrink-0 items-center gap-2">
            <MusicButton />
            <Button
              variant="secondary"
              size="sm"
              data-present-button
              aria-label="Present on a big screen"
              onClick={enterPresentation}
              className="max-sm:size-11 max-sm:px-0"
            >
              <Presentation className="size-4" aria-hidden="true" />
              <span className="max-sm:sr-only">Present</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              aria-haspopup="dialog"
              onClick={() => setMenuOpen(true)}
              className="max-sm:size-11 max-sm:px-0"
            >
              <Menu className="size-4" aria-hidden="true" />
              <span className="max-sm:sr-only">Chapters</span>
            </Button>
          </div>
        </div>
      </header>
      <ChapterMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

function ChapterMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { sections, activeId, goTo, enterPresentation } = useExperience();

  const navigate = (id: SectionId) => {
    onClose();
    // Wait for the dialog to close (and focus to settle) before moving on.
    requestAnimationFrame(() => goTo(id));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy="chapters-title"
      className="m-0 ml-auto h-dvh w-full max-w-md overflow-hidden bg-paper p-0 text-ink shadow-lift [animation-name:sheet-in] sm:rounded-l-[2rem]"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between px-6 pb-2 pt-[calc(env(safe-area-inset-top)+1.25rem)]">
          <h2 id="chapters-title" className="font-display text-3xl">
            Chapters
          </h2>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close chapters"
            onClick={onClose}
            data-autofocus
          >
            <X className="size-5" aria-hidden="true" />
          </Button>
        </div>
        <nav aria-label="Chapters" className="flex-1 overflow-y-auto overscroll-contain px-3 pb-4">
          <ol className="space-y-1">
            {sections.map((section) => {
              const current = section.id === activeId;
              return (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    aria-current={current ? "location" : undefined}
                    onClick={(event) => {
                      event.preventDefault();
                      navigate(section.id);
                    }}
                    className={cn(
                      "flex min-h-12 items-center gap-4 rounded-2xl px-4 py-3 text-lg transition-colors hover:bg-blush-50",
                      current && "bg-blush-100",
                    )}
                  >
                    <span className="w-8 shrink-0 font-display text-base italic text-rose-700">
                      {section.chapter === null ? (
                        <span aria-hidden="true">✦</span>
                      ) : (
                        String(section.chapter).padStart(2, "0")
                      )}
                    </span>
                    <span>{section.label}</span>
                    {current && (
                      <span
                        aria-hidden="true"
                        className="ml-auto size-2 rounded-full bg-rose-600"
                      />
                    )}
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>
        <div className="border-t border-sand px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-5">
          <Button
            className="w-full"
            onClick={() => {
              onClose();
              requestAnimationFrame(enterPresentation);
            }}
          >
            <Presentation className="size-4" aria-hidden="true" />
            Birthday presentation mode
          </Button>
          <p className="mt-3 text-center text-sm text-ink-soft">
            Bigger and calmer, one chapter at a time — made for a TV or projector.
          </p>
        </div>
      </div>
    </Modal>
  );
}
