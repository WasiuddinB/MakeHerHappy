"use client";

import { Camera } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { PlaceholderScene } from "@/components/decor/PlaceholderScene";
import { SmartImage } from "@/components/ui/SmartImage";
import type { GalleryPhoto } from "@/content/types";
import { cn } from "@/lib/cn";
import { Lightbox } from "./Lightbox";
import { ASPECT_CLASS } from "./photo-frames";

const TILTS = ["-1.6deg", "1.2deg", "-0.7deg", "1.8deg", "-1.2deg", "0.6deg"];
const TAPES = ["bg-peach-200/85", "bg-lavender-200/90", "bg-blush-200/90"];

export function MemoryGallery({ photos }: { photos: GalleryPhoto[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <ul className="mx-auto mt-14 max-w-6xl columns-2 gap-4 sm:columns-3 sm:gap-6 lg:columns-4">
        {photos.map((photo, index) => (
          <li key={`${index}-${photo.src ?? photo.alt}`} className="mb-6 break-inside-avoid pt-2">
            <figure
              style={{ "--tilt": TILTS[index % TILTS.length] } as CSSProperties}
              className="paper group relative rotate-(--tilt) rounded-[0.4rem] p-2 pb-3 shadow-paper ring-1 ring-sand/70 transition-[rotate,translate,box-shadow] duration-500 ease-soft focus-within:rotate-0 hover:-translate-y-1 hover:rotate-0 hover:shadow-lift sm:p-2.5"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "absolute -top-2.5 left-1/2 z-10 h-5 w-16 -translate-x-1/2 -rotate-2 shadow-sm",
                  TAPES[index % TAPES.length],
                )}
              />
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={() => setOpenIndex(index)}
                className={cn(
                  "relative block w-full overflow-hidden rounded-[0.2rem] bg-cream",
                  ASPECT_CLASS[photo.orientation],
                )}
              >
                {photo.src ? (
                  <SmartImage
                    src={photo.src}
                    alt={photo.alt}
                    sizes="(min-width: 1024px) 17rem, (min-width: 640px) 31vw, 46vw"
                    className="object-cover transition-transform duration-700 ease-soft group-hover:scale-[1.03]"
                    style={{ objectPosition: photo.focus ?? "50% 50%" }}
                  />
                ) : (
                  <>
                    <PlaceholderScene variant={index} />
                    <span className="sr-only">{photo.alt}</span>
                    <span
                      aria-hidden="true"
                      className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-paper/90 px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-wider text-ink-soft"
                    >
                      <Camera className="size-3" />
                      Your photo here
                    </span>
                  </>
                )}
                <span className="sr-only"> (open larger)</span>
              </button>
              {photo.caption && (
                <figcaption className="px-1 pt-2.5 text-center font-hand text-xl leading-tight text-ink">
                  {photo.caption}
                </figcaption>
              )}
            </figure>
          </li>
        ))}
      </ul>

      <Lightbox
        photos={photos}
        index={openIndex}
        onNavigate={setOpenIndex}
        onClose={() => setOpenIndex(null)}
      />
    </>
  );
}
