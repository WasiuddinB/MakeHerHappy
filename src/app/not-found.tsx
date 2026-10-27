import Link from "next/link";
import { ConstellationHeart } from "@/components/decor/ConstellationHeart";
import { buttonClasses } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-ivory px-6 py-16 text-center">
      <ConstellationHeart className="w-24" />
      <p className="eyebrow mt-8 text-rose-700">Page not found</p>
      <h1 className="mt-4 max-w-xl font-display text-[clamp(2.2rem,7vw,3.6rem)] leading-tight">
        This page drifted off among the stars
      </h1>
      <p className="mt-4 max-w-md text-lg text-ink-soft">
        The little universe you’re looking for is just one step away.
      </p>
      <Link href="/" className={buttonClasses({ className: "mt-8" })}>
        Take me home
      </Link>
    </main>
  );
}
