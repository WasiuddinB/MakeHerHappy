import { useSyncExternalStore } from "react";
import { SECOND_MS } from "./date-utils";

/* ── Reduced motion ───────────────────────────────────────────────────── */

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** Non-hook check, for event handlers and effects. */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReducedMotion, prefersReducedMotion, () => false);
}

/* ── Hydration ────────────────────────────────────────────────────────── */

const noopSubscribe = () => () => {};

/** false during server rendering and hydration, true afterwards. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/* ── A shared clock ───────────────────────────────────────────────────────
 * One timer, aligned to the start of each second, shared by every
 * component that needs the time. The server snapshot is `null`, so the
 * server (and hydration) never reads the clock — avoiding both hydration
 * mismatches and prerendering the build-time date into the page. */

let clockNow = 0;
let clockTimer: ReturnType<typeof setTimeout> | undefined;
const clockListeners = new Set<() => void>();

function scheduleTick() {
  clockTimer = setTimeout(tick, SECOND_MS - (Date.now() % SECOND_MS) + 5);
}

function tick() {
  clockNow = Date.now();
  clockListeners.forEach((listener) => listener());
  scheduleTick();
}

function handleVisibilityChange() {
  // Background tabs throttle timers; catch up as soon as the tab is visible.
  if (document.visibilityState === "visible") {
    clearTimeout(clockTimer);
    tick();
  }
}

function subscribeClock(listener: () => void) {
  clockListeners.add(listener);
  if (clockListeners.size === 1) {
    clockNow = Date.now();
    scheduleTick();
    document.addEventListener("visibilitychange", handleVisibilityChange);
  }
  return () => {
    clockListeners.delete(listener);
    if (clockListeners.size === 0) {
      clearTimeout(clockTimer);
      clockTimer = undefined;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    }
  };
}

function getClockSnapshot(): number {
  if (clockNow === 0) clockNow = Date.now();
  return clockNow;
}

function getServerClockSnapshot(): null {
  return null;
}

/** The current time, updated every second; `null` until hydrated. */
export function useNow(): number | null {
  return useSyncExternalStore(subscribeClock, getClockSnapshot, getServerClockSnapshot);
}
