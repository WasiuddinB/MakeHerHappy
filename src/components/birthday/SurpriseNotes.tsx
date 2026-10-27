"use client";

import { Check, Heart, Mail, Undo2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { Note } from "@/content/types";
import { cn } from "@/lib/cn";

const FLAPS = ["bg-blush-100", "bg-peach-100", "bg-lavender-100"];

interface SurpriseNotesProps {
  notes: Note[];
  signOff: string;
}

export function SurpriseNotes({ notes, signOff }: SurpriseNotesProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [opened, setOpened] = useState<ReadonlySet<number>>(() => new Set());
  const [announcement, setAnnouncement] = useState("");
  const note = openIndex === null ? undefined : notes[openIndex];

  const openNote = (index: number) => {
    setOpenIndex(index);
    setOpened((previous) => new Set(previous).add(index));
  };

  const openAnother = () => {
    if (openIndex === null) return;
    const unread = notes.findIndex((_, index) => index !== openIndex && !opened.has(index));
    const next = unread === -1 ? (openIndex + 1) % notes.length : unread;
    openNote(next);
    // The dialog stays open, so tell screen readers what changed.
    setAnnouncement(`${notes[next].label}. ${notes[next].message}`);
  };

  const close = () => {
    setOpenIndex(null);
    setAnnouncement("");
  };

  return (
    <>
      <p className="mt-6 text-center text-sm font-medium text-ink-soft">
        {opened.size} of {notes.length} opened
      </p>

      <ul className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-8 md:grid-cols-3">
        {notes.map((item, index) => {
          const isOpened = opened.has(index);
          return (
            <li key={`${index}-${item.label}`}>
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={() => openNote(index)}
                className="group flex w-full flex-col items-center gap-4 rounded-2xl p-1 text-center"
              >
                <span
                  aria-hidden="true"
                  className="relative block aspect-[1.5] w-full max-w-[13rem] transition-[translate,rotate] duration-500 ease-soft group-hover:-translate-y-1 group-hover:-rotate-1"
                >
                  <span className="paper absolute inset-0 rounded-lg shadow-paper ring-1 ring-sand" />
                  <span className="absolute inset-0 rounded-lg bg-[linear-gradient(to_top_right,transparent_49.3%,var(--color-sand)_50%,transparent_50.7%),linear-gradient(to_top_left,transparent_49.3%,var(--color-sand)_50%,transparent_50.7%)]" />
                  <span
                    className={cn(
                      "absolute inset-x-0 top-0 h-[56%] rounded-t-lg shadow-[0_2px_4px_-2px_rgb(61_15_32/0.2)] [clip-path:polygon(0_0,100%_0,50%_100%)]",
                      FLAPS[index % FLAPS.length],
                      isOpened && "opacity-60",
                    )}
                  />
                  <span
                    className={cn(
                      "absolute left-1/2 top-[56%] grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full shadow-[0_6px_12px_-6px_rgb(61_15_32/0.7)] transition-transform duration-300 group-hover:scale-110",
                      isOpened
                        ? "bg-paper text-rose-700 ring-1 ring-rose-400/40"
                        : "bg-rose-700 text-gold-100",
                    )}
                  >
                    {isOpened ? (
                      <Check className="size-4" />
                    ) : (
                      <Heart className="size-4 fill-current" />
                    )}
                  </span>
                </span>
                <span className="font-hand text-[1.35rem] leading-tight text-ink sm:text-2xl">
                  {item.label}
                </span>
                {isOpened && <span className="sr-only">(already opened)</span>}
              </button>
            </li>
          );
        })}
      </ul>

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      <Modal
        open={note !== undefined}
        onClose={close}
        labelledBy="note-title"
        describedBy="note-message"
        className="m-auto w-[min(92vw,34rem)] overflow-visible bg-transparent p-0"
      >
        {note && openIndex !== null && (
          <NoteCard
            key={openIndex}
            note={note}
            position={openIndex + 1}
            total={notes.length}
            signOff={signOff}
            onClose={close}
            onOpenAnother={notes.length > 1 ? openAnother : undefined}
          />
        )}
      </Modal>
    </>
  );
}

interface NoteCardProps {
  note: Note;
  position: number;
  total: number;
  signOff: string;
  onClose: () => void;
  onOpenAnother?: () => void;
}

function NoteCard({ note, position, total, signOff, onClose, onOpenAnother }: NoteCardProps) {
  const primaryRef = useRef<HTMLButtonElement>(null);

  // Each note remounts (for its unfold animation); keep focus inside it.
  useEffect(() => {
    primaryRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div className="paper relative rounded-[1.75rem] px-7 pb-8 pt-12 text-ink shadow-lift motion-safe:animate-[unfold_0.6s_var(--ease-soft)_both] sm:px-10">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Close note"
        onClick={onClose}
        className="absolute right-3 top-3"
      >
        <X className="size-5" aria-hidden="true" />
      </Button>
      <p className="eyebrow text-rose-700">
        Note {position} of {total}
      </p>
      <h2
        id="note-title"
        className="mt-3 font-hand text-4xl leading-tight text-rose-700 sm:text-5xl"
      >
        {note.label}
      </h2>
      <p id="note-message" className="mt-5 font-display text-xl leading-relaxed sm:text-[1.35rem]">
        {note.message}
      </p>
      <p className="mt-6 font-hand text-2xl text-ink-soft">{signOff}</p>
      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button
          variant="secondary"
          onClick={onClose}
          ref={onOpenAnother ? undefined : primaryRef}
          data-autofocus={onOpenAnother ? undefined : true}
        >
          <Undo2 className="size-4" aria-hidden="true" />
          Fold it back
        </Button>
        {onOpenAnother && (
          <Button onClick={onOpenAnother} ref={primaryRef} data-autofocus>
            <Mail className="size-4" aria-hidden="true" />
            Open another
          </Button>
        )}
      </div>
    </div>
  );
}
