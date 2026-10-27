import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute("data-presentation");
  document.documentElement.style.overflow = "";
});

/* ── Browser APIs that jsdom does not implement ─────────────────────────── */

// <dialog>: just enough of the modal API for our Modal component.
const dialogProto = HTMLDialogElement.prototype as HTMLDialogElement & {
  showModal?: () => void;
};
if (!("open" in HTMLDialogElement.prototype)) {
  Object.defineProperty(HTMLDialogElement.prototype, "open", {
    configurable: true,
    get(this: HTMLDialogElement) {
      return this.hasAttribute("open");
    },
    set(this: HTMLDialogElement, value: boolean) {
      this.toggleAttribute("open", Boolean(value));
    },
  });
}
if (typeof dialogProto.showModal !== "function") {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.show = function show(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    if (!this.hasAttribute("open")) return;
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
}

// matchMedia: everything reports "no match" unless a test overrides it.
if (typeof window.matchMedia !== "function") {
  window.matchMedia = (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}

// IntersectionObserver: records observed elements; tests can trigger entries.
type ObserverRecord = {
  callback: IntersectionObserverCallback;
  elements: Set<Element>;
  instance: IntersectionObserver;
};
const observers = new Set<ObserverRecord>();

class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "0px";
  readonly scrollMargin = "0px";
  readonly thresholds = [0];
  private record: ObserverRecord;

  constructor(callback: IntersectionObserverCallback) {
    this.record = { callback, elements: new Set(), instance: this };
    observers.add(this.record);
  }
  observe(element: Element) {
    this.record.elements.add(element);
  }
  unobserve(element: Element) {
    this.record.elements.delete(element);
  }
  disconnect() {
    this.record.elements.clear();
    observers.delete(this.record);
  }
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}
vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

/** Simulates `element` scrolling into (or out of) view for every observer watching it. */
export function triggerIntersection(element: Element, isIntersecting = true) {
  for (const record of observers) {
    if (!record.elements.has(element)) continue;
    const rect = element.getBoundingClientRect();
    record.callback(
      [
        {
          target: element,
          isIntersecting,
          intersectionRatio: isIntersecting ? 1 : 0,
          boundingClientRect: rect,
          intersectionRect: rect,
          rootBounds: null,
          time: performance.now(),
        },
      ],
      record.instance,
    );
  }
}

if (typeof window.ResizeObserver !== "function") {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
}

if (typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = function scrollIntoView() {};
}

// jsdom's scrollTo exists but only logs "not implemented".
window.scrollTo = (() => {}) as typeof window.scrollTo;

// jsdom logs a noisy "not implemented" error for canvas; our confetti
// already copes with a missing 2D context, so return null quietly.
HTMLCanvasElement.prototype.getContext = (() =>
  null) as typeof HTMLCanvasElement.prototype.getContext;
