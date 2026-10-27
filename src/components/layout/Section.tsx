import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { headingId, type SectionId } from "@/lib/sections";

interface SectionProps {
  id: SectionId;
  tone?: "light" | "dark";
  className?: string;
  children: ReactNode;
}

/** A page section: an anchor target, a landmark labelled by its heading, and a presentation-mode slide. */
export function Section({ id, tone = "light", className, children }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={headingId(id)}
      data-section
      data-tone={tone}
      className={cn("relative isolate overflow-x-clip", className)}
    >
      {children}
    </section>
  );
}
