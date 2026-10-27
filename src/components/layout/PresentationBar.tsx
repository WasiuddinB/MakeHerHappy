"use client";

import { ChevronLeft, ChevronRight, Maximize, Minimize, QrCode, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { PresentationSettings } from "@/content/types";
import type { ShareCard } from "@/lib/qr";
import { useExperience } from "./Experience";
import { MusicButton } from "./MusicButton";

/** Floating controls shown only in presentation mode. */
export function PresentationBar() {
  const {
    presenting,
    sections,
    activeId,
    next,
    previous,
    exitPresentation,
    canFullscreen,
    isFullscreen,
    fullscreenError,
    toggleFullscreen,
    share,
    presentationCopy,
  } = useExperience();
  const [shareOpen, setShareOpen] = useState(false);
  const nextRef = useRef<HTMLButtonElement>(null);

  // The button that started presentation mode is now hidden, so give
  // keyboard users a sensible place to continue from.
  useEffect(() => {
    if (presenting) nextRef.current?.focus({ preventScroll: true });
  }, [presenting]);

  if (!presenting) return null;

  const index = Math.max(
    sections.findIndex((section) => section.id === activeId),
    0,
  );
  const current = sections[index];

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        {fullscreenError && (
          <p
            role="status"
            className="pointer-events-auto rounded-full bg-midnight/85 px-4 py-2 text-sm text-gold-100 backdrop-blur-md"
          >
            Full screen isn’t available here — presentation mode still works.
          </p>
        )}
        <div
          role="toolbar"
          aria-label="Presentation controls"
          className="pointer-events-auto flex max-w-full items-center gap-1 rounded-full bg-midnight/85 p-1.5 text-paper shadow-lift ring-1 ring-white/10 backdrop-blur-md"
        >
          {/* aria-disabled (not disabled) so focus isn't lost at either end. */}
          <Button
            variant="night"
            size="icon"
            aria-label="Previous chapter"
            aria-disabled={index === 0}
            onClick={() => index > 0 && previous()}
            className="aria-disabled:opacity-40"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </Button>
          <p className="min-w-0 px-2 text-center text-sm" aria-live="polite">
            <span className="font-display italic text-gold-200">
              {index + 1} / {sections.length}
            </span>
            <span className="max-sm:sr-only"> · {current?.label}</span>
          </p>
          <Button
            ref={nextRef}
            variant="night"
            size="icon"
            aria-label="Next chapter"
            aria-disabled={index === sections.length - 1}
            onClick={() => index < sections.length - 1 && next()}
            className="aria-disabled:opacity-40"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </Button>
          <span aria-hidden="true" className="mx-1 h-6 w-px bg-white/15" />
          <MusicButton tone="night" />
          {canFullscreen && (
            <Button
              variant="night"
              size="icon"
              aria-label="Full screen"
              aria-pressed={isFullscreen}
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize className="size-4" aria-hidden="true" />
              ) : (
                <Maximize className="size-4" aria-hidden="true" />
              )}
            </Button>
          )}
          {share && (
            <Button
              variant="night"
              size="icon"
              aria-label="Show a QR code to open this site on a phone"
              aria-haspopup="dialog"
              onClick={() => setShareOpen(true)}
            >
              <QrCode className="size-4" aria-hidden="true" />
            </Button>
          )}
          <Button variant="night" size="sm" onClick={exitPresentation} className="ml-0.5">
            <X className="size-4" aria-hidden="true" />
            Exit
          </Button>
        </div>
      </div>
      {share && (
        <ShareDialog
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          share={share}
          copy={presentationCopy}
        />
      )}
    </>
  );
}

function ShareDialog({
  open,
  onClose,
  share,
  copy,
}: {
  open: boolean;
  onClose: () => void;
  share: ShareCard;
  copy: PresentationSettings;
}) {
  const quiet = 4;
  const box = share.qrSize + quiet * 2;
  const displayUrl = share.url.replace(/^https:\/\//, "").replace(/\/$/, "");

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy="share-title"
      describedBy="share-message"
      className="m-auto w-[min(92vw,32rem)] rounded-4xl bg-paper p-0 text-ink shadow-lift"
    >
      <div className="relative px-7 pb-8 pt-10 text-center sm:px-10">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close"
          onClick={onClose}
          data-autofocus
          className="absolute right-3 top-3"
        >
          <X className="size-5" aria-hidden="true" />
        </Button>
        <h2 id="share-title" className="font-display text-3xl">
          {copy.shareHeading}
        </h2>
        <p id="share-message" className="mt-2 text-ink-soft">
          {copy.shareMessage}
        </p>
        <svg
          role="img"
          aria-label={`QR code that opens ${displayUrl}`}
          viewBox={`${-quiet} ${-quiet} ${box} ${box}`}
          shapeRendering="crispEdges"
          className="mx-auto mt-6 aspect-square w-full max-w-[min(55svh,20rem)] rounded-2xl ring-1 ring-sand"
        >
          <rect x={-quiet} y={-quiet} width={box} height={box} fill="#ffffff" />
          <path d={share.qrPath} fill="#15112a" />
        </svg>
        <p className="mt-5 break-all font-medium text-rose-700">{displayUrl}</p>
      </div>
    </Modal>
  );
}
