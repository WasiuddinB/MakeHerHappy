"use client";

import { cn } from "@/lib/cn";
import { useExperience } from "./Experience";

/** A quiet chapter rail on wide screens, showing where you are. */
export function SectionDots() {
  const { sections, activeId, goTo } = useExperience();

  return (
    <nav
      aria-label="Chapter shortcuts"
      data-hide-in-presentation
      className="fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 xl:block"
    >
      <ol className="flex flex-col items-center gap-0.5 rounded-full bg-paper/75 px-1.5 py-2.5 shadow-paper ring-1 ring-sand/70 backdrop-blur-md">
        {sections.map((section) => {
          const current = section.id === activeId;
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={current ? "location" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  goTo(section.id);
                }}
                className="group relative flex size-7 items-center justify-center rounded-full"
              >
                <span
                  className={cn(
                    "block w-2 rounded-full transition-all duration-500 ease-soft",
                    current ? "h-5 bg-rose-700" : "h-2 bg-rose-500 group-hover:bg-rose-700",
                  )}
                />
                <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-full bg-ink px-3 py-1 text-xs font-medium text-paper opacity-0 shadow-paper transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  {section.label}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
