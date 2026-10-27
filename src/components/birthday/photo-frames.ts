import type { Orientation } from "@/content/types";

/** Frame shape for each orientation; photos are cropped to fit (object-fit: cover). */
export const ASPECT_CLASS: Record<Orientation, string> = {
  portrait: "aspect-[4/5]",
  landscape: "aspect-[4/3]",
  square: "aspect-square",
};
