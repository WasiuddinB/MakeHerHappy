"use client";

import { ImageOff } from "lucide-react";
import Image, { type ImageProps } from "next/image";
import { useCallback, useState } from "react";
import { cn } from "@/lib/cn";

type Status = "loading" | "loaded" | "error";

type SmartImageProps = Omit<ImageProps, "fill" | "onLoad" | "onError"> & {
  /** Shown if the file is missing or can't be decoded. */
  fallbackLabel?: string;
};

/**
 * next/image in `fill` mode (the parent must be positioned) with a soft
 * shimmer while loading and a gentle message — instead of a broken-image
 * icon — if the file is missing.
 */
export function SmartImage({
  alt,
  className,
  fallbackLabel = "This photo couldn’t be loaded",
  ...props
}: SmartImageProps) {
  const [status, setStatus] = useState<Status>("loading");

  // Images can finish (or fail) before React hydrates and attaches onLoad.
  const checkAlreadySettled = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete) setStatus(img.naturalWidth > 0 ? "loaded" : "error");
  }, []);

  if (status === "error") {
    return (
      <span
        role="img"
        aria-label={alt}
        className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-cream p-4 text-ink-soft"
      >
        <ImageOff className="size-6" aria-hidden="true" />
        <span className="text-center text-sm">{fallbackLabel}</span>
      </span>
    );
  }

  return (
    <>
      {status === "loading" && (
        <span
          aria-hidden="true"
          className="absolute inset-0 animate-shimmer bg-[linear-gradient(100deg,var(--color-cream)_30%,var(--color-paper)_50%,var(--color-cream)_70%)] bg-size-[200%_100%]"
        />
      )}
      <Image
        {...props}
        ref={checkAlreadySettled}
        fill
        alt={alt}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
        className={cn(
          "transition-opacity duration-700 ease-soft",
          status === "loaded" ? "opacity-100" : "opacity-0",
          className,
        )}
      />
    </>
  );
}
