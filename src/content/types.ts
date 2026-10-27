/**
 * The shape of everything the birthday site displays.
 *
 * You should never need to edit this file to personalise the site —
 * edit `src/content/birthday.ts` instead. TypeScript uses these types to
 * warn you (in your editor and in `npm run typecheck`) if a field is
 * missing or misspelled.
 */

/** Icons you can attach to cards, moments and surprises. */
export type IconName =
  | "book"
  | "cake"
  | "camera"
  | "candy"
  | "cloud-sun"
  | "coffee"
  | "feather"
  | "flower"
  | "footprints"
  | "gem"
  | "gift"
  | "hand-heart"
  | "heart"
  | "home"
  | "infinity"
  | "laugh"
  | "leaf"
  | "lightbulb"
  | "map-pin"
  | "moon"
  | "mountain"
  | "music"
  | "party"
  | "plane"
  | "smile"
  | "sparkles"
  | "star"
  | "sun"
  | "umbrella"
  | "utensils";

export interface People {
  her: {
    /** Her name, as it should appear in the big birthday headline. */
    name: string;
    /** What you call her — used in the letter, envelope and notes. */
    nickname: string;
  };
  you: {
    /** Your name, used to sign the letter, notes and final dedication. */
    name: string;
  };
}

export interface BirthdayDate {
  year: number;
  /** 1 = January … 12 = December. */
  month: number;
  day: number;
  /**
   * The IANA time zone the celebration follows, e.g. "Asia/Dhaka".
   * The countdown reaches zero at midnight in this zone, wherever the
   * visitor happens to be.
   */
  timeZone: string;
}

export interface SiteSettings {
  /** Browser-tab title and social-preview title. Keep personal details out. */
  title: string;
  /** Short description for link previews. Keep personal details out. */
  description: string;
  /**
   * Your public URL, e.g. "https://our-little-universe.vercel.app".
   * Optional — it can also come from the NEXT_PUBLIC_SITE_URL environment
   * variable, or Vercel's production URL. A share QR code is only shown
   * once a real public URL is known.
   */
  url?: string;
  /**
   * `false` asks search engines not to list the site. This is only a
   * request to well-behaved crawlers — it is NOT a privacy control.
   */
  allowSearchIndexing: boolean;
  /** BCP 47 language tag for the page, e.g. "en". */
  language: string;
}

export interface HeroContent {
  /** Small line above the headline. */
  eyebrow: string;
  /** Appears before her name, e.g. "Happy birthday,". */
  greeting: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
  scrollHint: string;
}

interface SectionBase {
  /** Short label used in the menu and presentation mode. */
  navLabel: string;
  /** Small text above the section heading. */
  eyebrow: string;
  heading: string;
  intro?: string;
}

export interface CountdownMessage {
  title: string;
  message: string;
}

export interface CountdownContent {
  navLabel: string;
  /** Shown before the birthday, above the live countdown. */
  upcoming: CountdownMessage;
  /** Shown on the birthday itself (all day, in the celebration time zone). */
  birthday: CountdownMessage;
  /** Shown once the birthday has passed. */
  after: CountdownMessage;
}

export interface LetterContent extends SectionBase {
  /** Handwritten on the front of the envelope. */
  envelopeNote: string;
  /** Text on the button that breaks the wax seal. */
  openLabel: string;
  greeting: string;
  /** One string per paragraph. */
  paragraphs: string[];
  closing: string;
  signature: string;
  postscript?: string;
}

export interface Reason {
  title: string;
  message: string;
  icon?: IconName;
}

export interface AdoreContent extends SectionBase {
  reasons: Reason[];
}

export interface Photo {
  /** Path inside /public, e.g. "/images/story/first-date.jpg". */
  src: string;
  /** Describe the photo for people who can't see it. */
  alt: string;
  /**
   * Optional crop focus as a CSS object-position, e.g. "50% 30%"
   * (horizontal, vertical). Defaults to the centre.
   */
  focus?: string;
}

export interface Moment {
  title: string;
  /** A date or a gentle time marker, e.g. "June 2019" or "Once upon a time". */
  when?: string;
  description: string;
  photo?: Photo;
  icon?: IconName;
}

export interface StoryContent extends SectionBase {
  moments: Moment[];
}

export type Orientation = "portrait" | "landscape" | "square";

export interface GalleryPhoto {
  /**
   * Path inside /public, e.g. "/images/gallery/01.jpg". Leave it out to
   * show an illustrated placeholder until you add the real photo.
   */
  src?: string;
  /** Describe the photo for people who can't see it. */
  alt: string;
  caption?: string;
  orientation: Orientation;
  /** Optional crop focus as a CSS object-position, e.g. "50% 25%". */
  focus?: string;
}

export interface GalleryContent extends SectionBase {
  photos: GalleryPhoto[];
}

export interface Note {
  /** Written on the envelope, e.g. "Open when you need a smile". */
  label: string;
  message: string;
}

export interface NotesContent extends SectionBase {
  notes: Note[];
  /** Added under every note, e.g. "— Your name". */
  signOff: string;
}

export interface SurpriseChoice {
  /** A short unique id, e.g. "sweet". Used internally only. */
  id: string;
  label: string;
  teaser: string;
  icon: IconName;
  title: string;
  message: string;
  /** Optional second reveal, e.g. a joke's punchline. */
  bonus?: {
    prompt: string;
    reveal: string;
  };
}

export interface ChooseContent extends SectionBase {
  backLabel: string;
  /** Shown once every surprise has been opened. */
  allDoneMessage: string;
  choices: SurpriseChoice[];
}

export interface CakeContent extends SectionBase {
  /** How many candles to put on the cake (1–9 looks best). */
  candles: number;
  blowLabel: string;
  hint: string;
  celebrationTitle: string;
  celebrationMessage: string;
  relightLabel: string;
}

export interface FinaleContent extends SectionBase {
  buttonLabel: string;
  title: string;
  /** One string per paragraph. */
  dedication: string[];
  promise?: string;
  closing: string;
  signature: string;
  returnLabel: string;
}

export interface FooterContent {
  message: string;
  note?: string;
}

export interface MusicSettings {
  /** Path inside /public, e.g. "/audio/our-song.mp3". Only use music you have the right to use. */
  src: string;
  title: string;
  artist?: string;
}

export interface PresentationSettings {
  /** Heading on the share card in presentation mode. */
  shareHeading: string;
  /** Instruction under the share QR code. */
  shareMessage: string;
}

export interface BirthdayContent {
  people: People;
  date: BirthdayDate;
  site: SiteSettings;
  hero: HeroContent;
  countdown: CountdownContent;
  letter: LetterContent;
  adore: AdoreContent;
  story: StoryContent;
  gallery: GalleryContent;
  notes: NotesContent;
  choose: ChooseContent;
  cake: CakeContent;
  finale: FinaleContent;
  footer: FooterContent;
  /** Optional, user-started background music. Leave undefined for none. */
  music?: MusicSettings;
  presentation: PresentationSettings;
}
