/**
 * `npm run setup` rewrites src/content/birthday.ts from the answers you give
 * it. These tests make sure that rewriting never loses or mangles anything.
 */
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { applyNames, renderContentFile } from "../../scripts/content-writer.mjs";
import { birthday } from "@/content/birthday";
import type { BirthdayContent } from "@/content/types";

// Inside node_modules so the temporary file is ignored by git and TypeScript
// but still resolvable by the test runner.
const TEMP_DIR = join(process.cwd(), "node_modules", ".tmp-content-writer");

afterAll(async () => {
  await rm(TEMP_DIR, { recursive: true, force: true });
});

/** Writes the rendered file, imports it, and gives back the content object. */
async function roundTrip(content: BirthdayContent, templated?: Set<string>) {
  await mkdir(TEMP_DIR, { recursive: true });
  const file = join(TEMP_DIR, `content-${Math.random().toString(36).slice(2)}.ts`);
  await writeFile(file, renderContentFile(content, templated), "utf8");
  const written = (await import(/* @vite-ignore */ file)) as { birthday: BirthdayContent };
  return written.birthday;
}

describe("renderContentFile", () => {
  it("reproduces the shipped content exactly", async () => {
    expect(await roundTrip(birthday)).toEqual(birthday);
  });

  it("keeps the name constants wired up", async () => {
    const file = renderContentFile(birthday);
    expect(file).toContain(`const HER_NAME = ${JSON.stringify(birthday.people.her.name)};`);
    expect(file).toContain("her: { name: HER_NAME, nickname: HER_NICKNAME }");
    expect(file).toContain("you: { name: YOUR_NAME }");
  });

  it("survives apostrophes, quotes, backslashes and emoji", async () => {
    const awkward: BirthdayContent = structuredClone(birthday);
    awkward.people.her.name = 'A"wkward\\ Name';
    awkward.letter.paragraphs = [
      'She said "you\'re my favourite" — and I believed her ✨',
      "A backslash \\ and a template ${HER_NAME} walk into a bar`",
    ];
    awkward.footer.message = "Line one\nstill line one";

    const result = await roundTrip(awkward);
    expect(result.letter.paragraphs).toEqual(awkward.letter.paragraphs);
    expect(result.people.her.name).toBe(awkward.people.her.name);
    expect(result.footer.message).toBe(awkward.footer.message);
  });

  it("keeps optional fields that were removed removed", async () => {
    const trimmed: BirthdayContent = structuredClone(birthday);
    trimmed.letter.postscript = undefined;
    trimmed.finale.promise = undefined;
    trimmed.footer.note = undefined;

    const result = await roundTrip(trimmed);
    expect(result.letter.postscript).toBeUndefined();
    expect(result.finale.promise).toBeUndefined();
    expect(result.footer.note).toBeUndefined();
  });

  it("writes lists of any length, including empty ones", async () => {
    const edited: BirthdayContent = structuredClone(birthday);
    edited.adore.reasons = [{ title: "Only one", message: "That's all it takes.", icon: "heart" }];
    edited.story.moments = [];
    edited.notes.notes = [{ label: "Open me", message: "Hello." }];

    const result = await roundTrip(edited);
    expect(result.adore.reasons).toEqual(edited.adore.reasons);
    expect(result.story.moments).toEqual([]);
    expect(result.notes.notes).toEqual(edited.notes.notes);
  });

  it("keeps photos and their optional crop settings", async () => {
    const withPhotos: BirthdayContent = structuredClone(birthday);
    withPhotos.gallery.photos = [
      {
        src: "/images/gallery/01.jpg",
        alt: "Us",
        caption: "Hi",
        orientation: "portrait",
        focus: "50% 20%",
      },
      { alt: "Still to come", orientation: "square" },
    ];
    withPhotos.story.moments[0].photo = { src: "/images/story/a.jpg", alt: "A day out" };

    const result = await roundTrip(withPhotos);
    expect(result.gallery.photos).toEqual(withPhotos.gallery.photos);
    expect(result.story.moments[0].photo).toEqual(withPhotos.story.moments[0].photo);
  });

  it("writes music settings when they are filled in", async () => {
    const withMusic: BirthdayContent = structuredClone(birthday);
    withMusic.music = { src: "/audio/our-song.mp3", title: "Our song", artist: "Someone" };
    expect((await roundTrip(withMusic)).music).toEqual(withMusic.music);
  });
});

describe("applyNames", () => {
  const oldNames = { her: "Her Name", nickname: "Sweetheart", you: "Your Name" };
  const newNames = { her: "Aisha", nickname: "Love", you: "Wasi" };

  /**
   * Content whose sample text is built from `oldNames` — the state the
   * project ships in. Built explicitly so these tests keep working after
   * someone has personalised src/content/birthday.ts.
   */
  function sample(): BirthdayContent {
    const content: BirthdayContent = structuredClone(birthday);
    content.people.her.name = oldNames.her;
    content.people.her.nickname = oldNames.nickname;
    content.people.you.name = oldNames.you;
    content.letter.envelopeNote = `For ${oldNames.nickname}`;
    content.letter.greeting = `My dearest ${oldNames.nickname},`;
    content.letter.signature = oldNames.you;
    content.notes.signOff = `— ${oldNames.you}`;
    content.finale.title = `Happy birthday, ${oldNames.her}.`;
    content.finale.signature = `All my love, ${oldNames.you}`;
    content.footer.note = `For ${oldNames.nickname}, on her birthday`;
    return content;
  }

  it("carries new names into the sample text that was built from them", () => {
    const content = sample();
    const templated = applyNames(content, oldNames, newNames);

    expect(content.people.her.name).toBe("Aisha");
    expect(content.people.her.nickname).toBe("Love");
    expect(content.people.you.name).toBe("Wasi");
    expect(content.letter.envelopeNote).toBe("For Love");
    expect(content.letter.greeting).toBe("My dearest Love,");
    expect(content.notes.signOff).toBe("— Wasi");
    expect(content.finale.title).toBe("Happy birthday, Aisha.");
    expect(templated.has("letter.envelopeNote")).toBe(true);
  });

  it("leaves text you have already written alone", () => {
    const content = sample();
    content.letter.greeting = "My darling,";
    content.finale.title = "Happy birthday to the best person alive.";

    const templated = applyNames(content, oldNames, newNames);
    expect(content.letter.greeting).toBe("My darling,");
    expect(content.finale.title).toBe("Happy birthday to the best person alive.");
    expect(templated.has("letter.greeting")).toBe(false);
    // …while still updating the ones that were untouched.
    expect(content.notes.signOff).toBe("— Wasi");
  });

  it("renders the carried-over names as live constants", async () => {
    const content = sample();
    const templated = applyNames(content, oldNames, newNames);
    const file = renderContentFile(content, templated);

    expect(file).toContain("envelopeNote: `For ${HER_NICKNAME}`");
    expect(file).toContain("signOff: `— ${YOUR_NAME}`");
    expect(await roundTrip(content, templated)).toEqual(content);
  });
});
