"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useRef, useState } from "react";
import { PlaceholderScene } from "@/components/decor/PlaceholderScene";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { SmartImage } from "@/components/ui/SmartImage";
import type { GalleryPhoto } from "@/content/types";
import { cn } from "@/lib/cn";
import { ASPECT_CLASS } from "./photo-frames";

/** Each photo slides in from the side you're moving towards. */
function entranceFor(direction: number) {
  if (direction > 0) return "motion-safe:animate-[slide-in-right_0.45s_var(--ease-soft)_both]";
  if (direction < 0) return "motion-safe:animate-[slide-in-left_0.45s_var(--ease-soft)_both]";
  return "motion-safe:animate-fade";
}

const SWIPE_DISTANCE = 50;

interface LightboxProps {
  photos: GalleryPhoto[];
  /** Index of the open photo, or null when closed. */
  index: number | null;
  onNavigate: (index: number) => void;
  onClose: () => void;
}

export function Lightbox({ photos, index, onNavigate, onClose }: LightboxProps) {
  const [direction, setDirection] = useState(0);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const count = photos.length;
  const photo = index === null ? undefined : photos[index];

  const go = (delta: number) => {
    if (index === null || count < 2) return;
    setDirection(delta);
    onNavigate((index + delta + count) % count);
  };

  return (
    <Modal
      open={photo !== undefined}
      onClose={onClose}
      labelledBy="lightbox-title"
      dismissOnBackdrop={false}
      className="m-0 h-dvh w-dvw overflow-hidden bg-midnight/80 p-0 text-paper"
    >
      {photo && index !== null && (
        <div
          className="flex h-full flex-col"
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") {
              event.preventDefault();
              go(1);
            } else if (event.key === "ArrowLeft") {
              event.preventDefault();
              go(-1);
            }
          }}
        >
          <div className="flex items-center justify-between gap-4 px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] sm:px-6">
            <p className="text-sm text-lavender-200" aria-live="polite">
              Photo {index + 1} of {count}
            </p>
            <Button
              variant="night"
              size="icon"
              aria-label="Close photo viewer"
              onClick={onClose}
              data-autofocus
            >
              <X className="size-5" aria-hidden="true" />
            </Button>
          </div>

          {/* Stage: swipe left/right on touch screens. */}
          <div
            className="relative min-h-0 flex-1 touch-pan-y select-none"
            onPointerDown={(event) => {
              swipeStart.current = { x: event.clientX, y: event.clientY };
            }}
            onPointerUp={(event) => {
              const start = swipeStart.current;
              swipeStart.current = null;
              if (!start) return;
              const dx = event.clientX - start.x;
              const dy = event.clientY - start.y;
              if (Math.abs(dx) > SWIPE_DISTANCE && Math.abs(dx) > Math.abs(dy) * 1.2) {
                go(dx < 0 ? 1 : -1);
              }
            }}
            onPointerCancel={() => {
              swipeStart.current = null;
            }}
          >
            <div
              key={index}
              className={cn(
                "pointer-events-none absolute inset-0 flex items-center justify-center px-3 py-4 sm:px-20 sm:py-8",
                entranceFor(direction),
              )}
            >
              {photo.src ? (
                <div className="relative size-full">
                  <SmartImage
                    src={photo.src}
                    alt={photo.alt}
                    sizes="100vw"
                    className="object-contain"
                  />
                </div>
              ) : (
                <div
                  className={cn(
                    "relative max-h-full w-full max-w-[min(88vw,38rem)] overflow-hidden rounded-lg shadow-lift",
                    ASPECT_CLASS[photo.orientation],
                  )}
                >
                  <PlaceholderScene variant={index} />
                  <span className="sr-only">{photo.alt}</span>
                </div>
              )}
            </div>

            {count > 1 && (
              <>
                <Button
                  variant="night"
                  size="icon"
                  aria-label="Previous photo"
                  onClick={() => go(-1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-midnight/60 sm:left-6"
                >
                  <ChevronLeft className="size-5" aria-hidden="true" />
                </Button>
                <Button
                  variant="night"
                  size="icon"
                  aria-label="Next photo"
                  onClick={() => go(1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-midnight/60 sm:right-6"
                >
                  <ChevronRight className="size-5" aria-hidden="true" />
                </Button>
              </>
            )}
          </div>

          <div className="px-6 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-3 text-center">
            <h2 id="lightbox-title" className="font-hand text-3xl text-gold-100">
              {photo.caption ?? photo.alt}
            </h2>
            {!photo.src && (
              <p className="mt-1 text-sm text-lavender-200">
                Placeholder — your own photo will appear here.
              </p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
