/**
 * Turns a content object back into `src/content/birthday.ts`.
 *
 * `npm run setup` uses this to write your answers out as a normal, readable
 * TypeScript file — one you can keep editing by hand afterwards. The output
 * keeps the three name constants and the ✏️ guidance comments, so the file
 * stays as approachable as the one the project ships with.
 */

/* Fields whose sample text is built from the names. If one still matches the
 * old name, the wizard updates it and writes it back as a template literal,
 * so changing a name later keeps flowing through the file. */
export const DERIVED = {
  "letter.envelopeNote": (n) => `For ${n.nickname}`,
  "letter.greeting": (n) => `My dearest ${n.nickname},`,
  "letter.signature": (n) => n.you,
  "notes.signOff": (n) => `— ${n.you}`,
  "finale.title": (n) => `Happy birthday, ${n.her}.`,
  "finale.signature": (n) => `All my love, ${n.you}`,
  "footer.note": (n) => `For ${n.nickname}, on her birthday`,
};

/** How each derived field is written in the generated file. */
const DERIVED_SOURCE = {
  "people.her.name": "HER_NAME",
  "people.her.nickname": "HER_NICKNAME",
  "people.you.name": "YOUR_NAME",
  "letter.envelopeNote": "`For ${HER_NICKNAME}`",
  "letter.greeting": "`My dearest ${HER_NICKNAME},`",
  "letter.signature": "YOUR_NAME",
  "notes.signOff": "`— ${YOUR_NAME}`",
  "finale.title": "`Happy birthday, ${HER_NAME}.`",
  "finale.signature": "`All my love, ${YOUR_NAME}`",
  "footer.note": "`For ${HER_NICKNAME}, on her birthday`",
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Comments written above a key, by its path in the object. */
const COMMENTS = {
  date: ["/* Her birthday. The countdown reaches zero at midnight in this time zone. */"],
  "site.title": ["// Shown in browser tabs and link previews — keep personal details out."],
  "site.url": [
    '// ✏️ Optional: your public URL once deployed, e.g. "https://our-universe.vercel.app".',
    "// On Vercel this is detected automatically, so you can usually leave it out.",
  ],
  "site.allowSearchIndexing": [
    "// Search engines are asked not to list the site. (Not a privacy control!)",
  ],
  "letter.paragraphs": ["// ✏️ Your letter — one string per paragraph."],
  "adore.reasons": ["// ✏️ 8–12 reasons works best. Icons: see `IconName` in ./types.ts."],
  "story.moments": [
    '// ✏️ Your real moments. `when` can be a date ("June 2019") or a phrase.',
    "// Add a photo with:",
    '//   photo: { src: "/images/story/first-day.jpg", alt: "Describe the photo" },',
  ],
  "gallery.photos": [
    '// ✏️ Add `src: "/images/gallery/01.jpg"` to each entry once your photos are',
    "// in /public/images/gallery. Until then, illustrated placeholders are shown.",
    '// orientation: "portrait" (tall), "landscape" (wide) or "square".',
  ],
  "notes.notes": ["// ✏️ 5–7 notes works best."],
  "cake.candles": ["// How many candles to put on the cake (1–9 looks best)."],
  "finale.dedication": ["// ✏️ Your final dedication. One string per paragraph."],
  "finale.promise": ["// ✏️ Optional: a promise in your own words."],
  music: [
    "// Optional background music — off unless you add it. Only use a song you",
    "// have permission to use. Put the file in /public/audio and write:",
    '//   music: { src: "/audio/our-song.mp3", title: "Our song", artist: "Artist" },',
  ],
};

/** Keys that stay on one line, e.g. `her: { name: HER_NAME, nickname: HER_NICKNAME }`. */
const INLINE = new Set(["people.her", "people.you"]);

const INDENT = "  ";

function str(value) {
  // JSON.stringify gives correct escaping and leaves accented characters,
  // em dashes and emoji as themselves.
  return JSON.stringify(value);
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Same as `emit`, but on one line — and still honouring the name constants. */
function emitInline(value, path, templated) {
  const source = templated.has(path) ? DERIVED_SOURCE[path] : undefined;
  if (source) return source;

  if (isPlainObject(value)) {
    const body = Object.entries(value)
      .map(([key, item]) => `${key}: ${emitInline(item, `${path}.${key}`, templated)}`)
      .join(", ");
    return `{ ${body} }`;
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => emitInline(item, `${path}[]`, templated)).join(", ")}]`;
  }
  return value === undefined ? "undefined" : str(value);
}

function emit(value, depth, path, templated) {
  const source = templated.has(path) ? DERIVED_SOURCE[path] : undefined;
  if (source) return source;

  if (value === undefined) return "undefined";
  if (typeof value === "string") return str(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  const pad = INDENT.repeat(depth + 1);
  const closePad = INDENT.repeat(depth);

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const items = value.map((item) => {
      // `${path}[]` lets a comment or inline rule target every item of a list.
      const rendered = INLINE.has(`${path}[]`)
        ? emitInline(item, `${path}[]`, templated)
        : emit(item, depth + 1, `${path}[]`, templated);
      return `${pad}${rendered},`;
    });
    return `[\n${items.join("\n")}\n${closePad}]`;
  }

  if (isPlainObject(value)) {
    const lines = [];
    const entries = Object.entries(value);
    entries.forEach(([key, item], index) => {
      const keyPath = path ? `${path}.${key}` : key;
      // A blank line before each top-level section keeps the file breathable.
      if (depth === 0 && index > 0) lines.push("");
      for (const comment of COMMENTS[keyPath] ?? []) lines.push(`${pad}${comment}`);
      const rendered = INLINE.has(keyPath)
        ? emitInline(item, keyPath, templated)
        : emit(item, depth + 1, keyPath, templated);
      const trailing = keyPath === "date.month" ? ` // ${MONTHS[item - 1] ?? ""}` : "";
      lines.push(`${pad}${key}: ${rendered},${trailing}`);
    });
    return `{\n${lines.join("\n")}\n${closePad}}`;
  }

  throw new Error(`Cannot write a ${typeof value} into the content file (at "${path}")`);
}

const HEADER = `/* ──────────────────────────────────────────────────────────────────────────
 * ✏️  PERSONALISE THE WHOLE WEBSITE FROM THIS ONE FILE
 *
 * 1. Fill in the three names just below — they flow into every section.
 * 2. Work down the file and replace the words with your own.
 * 3. Add photos to /public/images (see public/images/README.md) and point
 *    the \`src\` fields at them.
 *
 * Save the file while \`npm run dev\` is running and the page updates
 * instantly. Optional fields can be deleted safely.
 *
 * Run \`npm run setup\` any time to go through the questions again.
 * ────────────────────────────────────────────────────────────────────────── */`;

/**
 * Renders the whole content file.
 *
 * @param content   the full BirthdayContent object
 * @param templated paths to write as name constants instead of plain strings
 */
export function renderContentFile(content, templated = new Set()) {
  const always = new Set([
    ...templated,
    "people.her.name",
    "people.her.nickname",
    "people.you.name",
  ]);
  const body = emit(content, 0, "", always);

  return `import type { BirthdayContent } from "./types";

${HEADER}

const HER_NAME = ${str(content.people.her.name)}; // ✏️ Her name, for the big headline
const HER_NICKNAME = ${str(content.people.her.nickname)}; // ✏️ What you call her ("My dearest …")
const YOUR_NAME = ${str(content.people.you.name)}; // ✏️ Your name, for signing the letter

export const birthday: BirthdayContent = ${body};
`;
}

/* ── small path helpers, shared with the wizard ──────────────────────────── */

export function getPath(object, path) {
  return path.split(".").reduce((value, key) => (value == null ? value : value[key]), object);
}

export function setPath(object, path, value) {
  const keys = path.split(".");
  const last = keys.pop();
  const parent = keys.reduce((value, key) => value[key], object);
  parent[last] = value;
}

/**
 * Applies new names, carrying them into any sample text still derived from
 * the old ones. Returns the set of paths to write as template literals.
 */
export function applyNames(content, oldNames, newNames) {
  const templated = new Set();
  for (const [path, derive] of Object.entries(DERIVED)) {
    if (getPath(content, path) === derive(oldNames)) {
      setPath(content, path, derive(newNames));
      templated.add(path);
    }
  }
  content.people.her.name = newNames.her;
  content.people.her.nickname = newNames.nickname;
  content.people.you.name = newNames.you;
  return templated;
}
