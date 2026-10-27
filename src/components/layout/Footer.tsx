import { Heart } from "lucide-react";
import type { BirthdayContent } from "@/content/types";

export function Footer({ content }: { content: BirthdayContent }) {
  const { footer, date } = content;
  return (
    <footer
      data-tone="dark"
      className="relative bg-midnight px-5 pb-[calc(env(safe-area-inset-bottom)+3rem)] pt-6 text-center text-lavender-200"
    >
      <div className="mx-auto max-w-xl border-t border-white/10 pt-12">
        <Heart
          className="mx-auto size-5 fill-rose-500 text-rose-500 motion-safe:animate-heartbeat"
          aria-hidden="true"
        />
        <p className="mt-4 font-display text-2xl italic text-paper">{footer.message}</p>
        {footer.note && (
          <p className="mt-2 text-sm">
            {footer.note} · <span>{date.year}</span>
          </p>
        )}
        <a
          href="#top"
          className="mt-8 inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium text-gold-100 underline decoration-gold-200/40 underline-offset-4 hover:decoration-gold-200"
        >
          Back to the top
        </a>
      </div>
    </footer>
  );
}
