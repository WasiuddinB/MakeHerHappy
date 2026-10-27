"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { MusicSettings, PresentationSettings } from "@/content/types";
import type { ShareCard } from "@/lib/qr";
import {
  captureScrollAnchor,
  restoreScrollAnchor,
  scrollToSection,
  type ScrollAnchor,
} from "@/lib/scroll";
import type { SectionId, SectionLink } from "@/lib/sections";

type MusicStatus = "paused" | "playing" | "error";

interface ExperienceValue {
  sections: SectionLink[];
  activeId: SectionId;
  goTo: (id: SectionId) => void;

  presenting: boolean;
  enterPresentation: () => void;
  exitPresentation: () => void;
  next: () => void;
  previous: () => void;

  canFullscreen: boolean;
  isFullscreen: boolean;
  fullscreenError: boolean;
  toggleFullscreen: () => void;

  music: MusicSettings | null;
  musicStatus: MusicStatus;
  toggleMusic: () => void;

  share: ShareCard | null;
  presentationCopy: PresentationSettings;
}

const ExperienceContext = createContext<ExperienceValue | null>(null);

export function useExperience(): ExperienceValue {
  const value = useContext(ExperienceContext);
  if (!value) throw new Error("useExperience must be used inside <ExperienceProvider>");
  return value;
}

/* ── External stores (read safely during hydration) ─────────────────────── */

const noopSubscribe = () => () => {};

function presentRequestedByUrl() {
  return new URLSearchParams(window.location.search).has("present");
}

function fullscreenSupported() {
  return (
    document.fullscreenEnabled === true &&
    typeof document.documentElement.requestFullscreen === "function"
  );
}

function subscribeFullscreen(onChange: () => void) {
  document.addEventListener("fullscreenchange", onChange);
  return () => document.removeEventListener("fullscreenchange", onChange);
}

const isDocumentFullscreen = () => document.fullscreenElement != null;
const serverFalse = () => false;

function isEditable(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || target.closest("input, textarea, select") !== null)
  );
}

interface ExperienceProviderProps {
  sections: SectionLink[];
  music: MusicSettings | null;
  share: ShareCard | null;
  presentationCopy: PresentationSettings;
  children: ReactNode;
}

export function ExperienceProvider({
  sections,
  music,
  share,
  presentationCopy,
  children,
}: ExperienceProviderProps) {
  /* Active section: whichever section crosses a thin band just above the
   * middle of the viewport. */
  const [activeId, setActiveId] = useState<SectionId>(sections[0]?.id ?? "top");
  const activeRef = useRef(activeId);

  useEffect(() => {
    activeRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    const crossing = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) crossing.set(entry.target.id, entry.isIntersecting);
        const current = sections.find((section) => crossing.get(section.id));
        if (current) setActiveId(current.id);
      },
      { rootMargin: "-45% 0px -54% 0px" },
    );
    for (const section of sections) {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [sections]);

  const goTo = useCallback((id: SectionId) => {
    setActiveId(id);
    scrollToSection(id);
  }, []);

  const step = useCallback(
    (delta: number) => {
      const index = sections.findIndex((section) => section.id === activeRef.current);
      const target = sections[Math.min(Math.max(index + delta, 0), sections.length - 1)];
      if (target) goTo(target.id);
    },
    [sections, goTo],
  );
  const next = useCallback(() => step(1), [step]);
  const previous = useCallback(() => step(-1), [step]);

  /* Presentation mode. `?present` in the URL starts in presentation mode
   * (handy for the party laptop); the buttons override it. */
  const [presentChoice, setPresentChoice] = useState<boolean | null>(null);
  const presentFromUrl = useSyncExternalStore(noopSubscribe, presentRequestedByUrl, serverFalse);
  const presenting = presentChoice ?? presentFromUrl;
  const anchorRef = useRef<ScrollAnchor | null>(null);

  const enterPresentation = useCallback(() => {
    anchorRef.current = captureScrollAnchor(activeRef.current);
    setPresentChoice(true);
  }, []);

  const exitPresentation = useCallback(() => {
    anchorRef.current = captureScrollAnchor(activeRef.current);
    setPresentChoice(false);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    // The presentation bar disappears; don't leave keyboard focus nowhere.
    requestAnimationFrame(() => {
      if (document.activeElement === document.body || document.activeElement === null) {
        document
          .querySelector<HTMLElement>("[data-present-button]")
          ?.focus({ preventScroll: true });
      }
    });
  }, []);

  // Layout effect: switch the page's scale before the browser paints, then
  // put the reader back at the same point in the same section.
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.toggleAttribute("data-presentation", presenting);
    const anchor = anchorRef.current;
    anchorRef.current = null;
    if (anchor) restoreScrollAnchor(anchor);
    return () => root.removeAttribute("data-presentation");
  }, [presenting]);

  useEffect(() => {
    if (!presenting) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      if (isEditable(event.target) || document.querySelector("dialog[open]")) return;

      switch (event.key) {
        case "ArrowRight":
        case "PageDown":
          event.preventDefault();
          next();
          break;
        case "ArrowLeft":
        case "PageUp":
          event.preventDefault();
          previous();
          break;
        case "Home":
          event.preventDefault();
          if (sections[0]) goTo(sections[0].id);
          break;
        case "End": {
          event.preventDefault();
          const last = sections.at(-1);
          if (last) goTo(last.id);
          break;
        }
        case "Escape":
          exitPresentation();
          break;
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [presenting, next, previous, goTo, sections, exitPresentation]);

  /* Full screen — only ever requested from a click, and failure is fine. */
  const canFullscreen = useSyncExternalStore(noopSubscribe, fullscreenSupported, serverFalse);
  const isFullscreen = useSyncExternalStore(subscribeFullscreen, isDocumentFullscreen, serverFalse);
  const [fullscreenError, setFullscreenError] = useState(false);

  const toggleFullscreen = useCallback(async () => {
    setFullscreenError(false);
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen({ navigationUI: "hide" });
    } catch {
      setFullscreenError(true);
    }
  }, []);

  /* Optional music — one <audio> element shared by every toggle. */
  const audioRef = useRef<HTMLAudioElement>(null);
  const [musicStatus, setMusicStatus] = useState<MusicStatus>("paused");

  const toggleMusic = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      return;
    }
    try {
      await audio.play();
    } catch {
      setMusicStatus("error");
    }
  }, []);

  const value = useMemo<ExperienceValue>(
    () => ({
      sections,
      activeId,
      goTo,
      presenting,
      enterPresentation,
      exitPresentation,
      next,
      previous,
      canFullscreen,
      isFullscreen,
      fullscreenError,
      toggleFullscreen,
      music,
      musicStatus,
      toggleMusic,
      share,
      presentationCopy,
    }),
    [
      sections,
      activeId,
      goTo,
      presenting,
      enterPresentation,
      exitPresentation,
      next,
      previous,
      canFullscreen,
      isFullscreen,
      fullscreenError,
      toggleFullscreen,
      music,
      musicStatus,
      toggleMusic,
      share,
      presentationCopy,
    ],
  );

  return (
    <ExperienceContext.Provider value={value}>
      {children}
      {music && (
        <audio
          ref={audioRef}
          src={music.src}
          preload="none"
          loop
          onPlay={() => setMusicStatus("playing")}
          onPause={() => setMusicStatus((status) => (status === "error" ? status : "paused"))}
          onError={() => setMusicStatus("error")}
        />
      )}
    </ExperienceContext.Provider>
  );
}
