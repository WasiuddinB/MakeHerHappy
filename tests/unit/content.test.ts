/**
 * Guards for src/content/birthday.ts. If you've just personalised the site
 * and one of these fails, the message tells you which field to fix.
 */
import { describe, expect, it } from "vitest";
import { birthday } from "@/content/birthday";
import type { BirthdayContent } from "@/content/types";
import { assertValidTimeZone, normalizeDay } from "@/lib/date-utils";
import { getSections, type SectionId } from "@/lib/sections";
import { parsePublicUrl } from "@/lib/site-url";

const filled = (value: string | undefined) => typeof value === "string" && value.trim().length > 0;

describe("birthday content", () => {
  it("has names for both of you", () => {
    expect(filled(birthday.people.her.name), "people.her.name").toBe(true);
    expect(filled(birthday.people.her.nickname), "people.her.nickname").toBe(true);
    expect(filled(birthday.people.you.name), "people.you.name").toBe(true);
  });

  it("has a real calendar date and time zone", () => {
    const { year, month, day, timeZone } = birthday.date;
    expect(normalizeDay({ year, month, day }), "date is not a real calendar day").toEqual({
      year,
      month,
      day,
    });
    expect(() => assertValidTimeZone(timeZone), `"${timeZone}" is not a time zone`).not.toThrow();
  });

  it("only uses a real public URL for sharing", () => {
    if (birthday.site.url) {
      expect(
        parsePublicUrl(birthday.site.url),
        "site.url must be a public https URL",
      ).not.toBeNull();
    }
  });

  it("points photos at files inside /public", () => {
    const sources = [
      ...birthday.gallery.photos.map((photo) => photo.src),
      ...birthday.story.moments.map((moment) => moment.photo?.src),
    ].filter((src): src is string => src !== undefined);

    for (const src of sources) {
      expect(src.startsWith("/"), `"${src}" should start with "/"`).toBe(true);
      expect(src.startsWith("/public/"), `"${src}" should not include "/public"`).toBe(false);
    }
  });

  it("describes every photo for screen readers", () => {
    for (const photo of birthday.gallery.photos) {
      expect(
        filled(photo.alt),
        `gallery photo "${photo.caption ?? photo.src}" needs alt text`,
      ).toBe(true);
    }
    for (const moment of birthday.story.moments) {
      if (moment.photo) expect(filled(moment.photo.alt), `photo for "${moment.title}"`).toBe(true);
    }
  });

  it("gives every surprise choice a unique id", () => {
    const ids = birthday.choose.choices.map((choice) => choice.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has a sensible number of candles", () => {
    expect(birthday.cake.candles).toBeGreaterThanOrEqual(1);
    expect(birthday.cake.candles).toBeLessThanOrEqual(9);
  });

  it("only uses music from this site", () => {
    if (birthday.music) expect(birthday.music.src.startsWith("/")).toBe(true);
  });
});

describe("getSections", () => {
  // Written against whatever is in the content file, so it keeps passing
  // after `npm run setup` — even if a section has been emptied out.
  const ORDER: SectionId[] = [
    "top",
    "countdown",
    "letter",
    "adore",
    "story",
    "gallery",
    "notes",
    "choose",
    "cake",
    "finale",
  ];

  it("keeps the chapters in order and numbers them from one", () => {
    const sections = getSections(birthday);
    const ids = sections.map((section) => section.id);

    expect(ids).toEqual(ORDER.filter((id) => ids.includes(id)));
    expect(ids).toContain("top");
    expect(sections[0].chapter).toBeNull();
    expect(sections.slice(1).map((section) => section.chapter)).toEqual(
      sections.slice(1).map((_, index) => index + 1),
    );
  });

  it("leaves out sections whose content is empty", () => {
    const sparse: BirthdayContent = {
      ...birthday,
      story: { ...birthday.story, moments: [] },
      gallery: { ...birthday.gallery, photos: [] },
    };
    const ids = getSections(sparse).map((section) => section.id);
    expect(ids).not.toContain("story");
    expect(ids).not.toContain("gallery");
    expect(getSections(sparse).at(-1)?.chapter).toBe(7);
  });
});
