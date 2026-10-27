import { AdoreSection } from "@/components/birthday/AdoreSection";
import { CakeSection } from "@/components/birthday/CakeSection";
import { ChooseSection } from "@/components/birthday/ChooseSection";
import { CountdownSection } from "@/components/birthday/CountdownSection";
import { FinaleSection } from "@/components/birthday/FinaleSection";
import { GallerySection } from "@/components/birthday/GallerySection";
import { HeroSection } from "@/components/birthday/HeroSection";
import { LetterSection } from "@/components/birthday/LetterSection";
import { NotesSection } from "@/components/birthday/NotesSection";
import { StorySection } from "@/components/birthday/StorySection";
import { ExperienceProvider } from "@/components/layout/Experience";
import { Footer } from "@/components/layout/Footer";
import { PresentationBar } from "@/components/layout/PresentationBar";
import { SectionDots } from "@/components/layout/SectionDots";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { birthday } from "@/content/birthday";
import { createShareCard } from "@/lib/qr";
import { getChapter, getSections, type SectionId } from "@/lib/sections";
import { getSiteUrl } from "@/lib/site-url";

export default function Home() {
  const sections = getSections(birthday);
  const has = (id: SectionId) => sections.some((section) => section.id === id);
  const chapter = (id: SectionId) => getChapter(sections, id);
  const share = createShareCard(getSiteUrl(birthday.site.url));

  return (
    <ExperienceProvider
      sections={sections}
      music={birthday.music ?? null}
      share={share}
      presentationCopy={birthday.presentation}
    >
      <SiteHeader brand={`for ${birthday.people.her.nickname}`} />
      <SectionDots />

      <main id="main" tabIndex={-1} className="outline-none">
        <HeroSection
          content={birthday}
          firstTarget={sections[1]?.id ?? "countdown"}
          storyTarget={has("story") ? "story" : (sections[1]?.id ?? "countdown")}
        />
        <CountdownSection content={birthday} chapter={chapter("countdown")} cakeTarget="cake" />
        {has("letter") && <LetterSection content={birthday} chapter={chapter("letter")} />}
        {has("adore") && <AdoreSection content={birthday} chapter={chapter("adore")} />}
        {has("story") && <StorySection content={birthday} chapter={chapter("story")} />}
        {has("gallery") && <GallerySection content={birthday} chapter={chapter("gallery")} />}
        {has("notes") && <NotesSection content={birthday} chapter={chapter("notes")} />}
        {has("choose") && <ChooseSection content={birthday} chapter={chapter("choose")} />}
        <CakeSection content={birthday} chapter={chapter("cake")} />
        <FinaleSection content={birthday} chapter={chapter("finale")} />
      </main>

      <Footer content={birthday} />
      <PresentationBar />
    </ExperienceProvider>
  );
}
