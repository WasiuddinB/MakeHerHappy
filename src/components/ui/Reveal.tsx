"use client";

import { useCallback, type CSSProperties, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/hooks";

type RevealFrom = "up" | "left" | "right" | "scale";

interface RevealProps {
  children: ReactNode;
  from?: RevealFrom;
  /** Delay in ms, for staggering siblings. */
  delay?: number;
  className?: string;
  as?: "div" | "li" | "article" | "figure";
}

/* One shared observer for every Reveal on the page. */
let observer: IntersectionObserver | null = null;
const callbacks = new WeakMap<Element, () => void>();

function observeOnce(element: Element, onVisible: () => void) {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        callbacks.get(entry.target)?.();
        callbacks.delete(entry.target);
        observer?.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px" },
  );
  callbacks.set(element, onVisible);
  observer.observe(element);
  return () => {
    callbacks.delete(element);
    observer?.unobserve(element);
  };
}

/**
 * Fades content in as it scrolls into view.
 *
 * Content is never hidden in the server HTML. After hydration, only
 * elements that are still below the fold are hidden and then revealed —
 * so slow JavaScript, no JavaScript or reduced motion all simply show
 * everything.
 */
export function Reveal({
  children,
  from = "up",
  delay = 0,
  className,
  as: Tag = "div",
}: RevealProps) {
  const revealRef = useCallback((element: HTMLElement | null) => {
    if (!element || prefersReducedMotion()) return;
    if (element.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    element.setAttribute("data-reveal", "pending");
    return observeOnce(element, () => element.setAttribute("data-reveal", "shown"));
  }, []);

  const style = delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined;

  return (
    <Tag
      ref={revealRef}
      className={className}
      style={style}
      data-reveal-from={from === "up" ? undefined : from}
    >
      {children}
    </Tag>
  );
}
