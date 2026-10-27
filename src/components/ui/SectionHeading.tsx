import { cn } from "@/lib/cn";
import { headingId, type SectionId } from "@/lib/sections";

interface SectionHeadingProps {
  section: SectionId;
  chapter?: number;
  eyebrow: string;
  title: string;
  intro?: string;
  tone?: "light" | "dark";
  align?: "center" | "left";
  className?: string;
}

export function SectionHeading({
  section,
  chapter,
  eyebrow,
  title,
  intro,
  tone = "light",
  align = "center",
  className,
}: SectionHeadingProps) {
  const dark = tone === "dark";
  return (
    <header className={cn("max-w-2xl", align === "center" ? "mx-auto text-center" : "", className)}>
      <p
        className={cn(
          "eyebrow flex items-center gap-3",
          align === "center" && "justify-center",
          dark ? "text-gold-200" : "text-rose-700",
        )}
      >
        {chapter !== undefined && (
          <>
            <span className="font-display text-sm font-normal normal-case italic tracking-normal">
              No. {String(chapter).padStart(2, "0")}
            </span>
            <span aria-hidden="true" className="h-px w-8 bg-current opacity-40" />
          </>
        )}
        <span>{eyebrow}</span>
      </p>
      <h2
        id={headingId(section)}
        tabIndex={-1}
        data-section-heading
        className={cn(
          "mt-4 font-display text-[clamp(2.3rem,7vw,4.4rem)] leading-[1.04] tracking-[-0.015em] outline-none",
          dark ? "text-paper" : "text-ink",
        )}
      >
        {title}
      </h2>
      {intro && (
        <p
          className={cn(
            "mt-5 text-lg leading-relaxed sm:text-xl",
            dark ? "text-lavender-200" : "text-ink-soft",
          )}
        >
          {intro}
        </p>
      )}
    </header>
  );
}
