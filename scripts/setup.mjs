/**
 * A guided setup for the birthday site:
 *
 *     npm run setup
 *
 * It asks for the names, the date and — if you want — the words for every
 * section, then writes `src/content/birthday.ts` for you. Press Enter at any
 * question to keep what's already there, so you can run it as many times as
 * you like and only change what you want to change.
 *
 * Your previous file is always backed up first.
 */
import { createInterface } from "node:readline/promises";
import { copyFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";
import { stdin, stdout } from "node:process";
import { birthday } from "../src/content/birthday.ts";
import { assertValidTimeZone, normalizeDay } from "../src/lib/date-utils.ts";
import { applyNames, renderContentFile } from "./content-writer.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT_FILE = join(ROOT, "src", "content", "birthday.ts");

/* ── Looks ───────────────────────────────────────────────────────────────── */

// Colour only when a terminal is attached and the user hasn't opted out.
const colour = stdout.isTTY && !process.env.NO_COLOR;
const paint = (code) => (text) => (colour ? `\u001b[${code}m${text}\u001b[0m` : text);
const bold = paint("1");
const dim = paint("2");
const rose = paint("38;5;175");
const gold = paint("38;5;179");

const say = (line = "") => stdout.write(`${line}\n`);

function heading(title) {
  say();
  say(`  ${rose("──")} ${bold(title)} ${rose("─".repeat(Math.max(2, 46 - title.length)))}`);
}

/* ── Asking ──────────────────────────────────────────────────────────────── */

/* Normally the answers come from a person at a terminal. When they're piped
 * in instead (a test, or `printf ... | npm run setup`), readline closes as
 * soon as the pipe ends and would swallow lines that haven't been asked for
 * yet — so in that case the answers are read up front and handed out one at
 * a time. */
const interactive = Boolean(stdin.isTTY);
const rl = interactive ? createInterface({ input: stdin, output: stdout }) : null;
let scripted = null;

async function readPipedAnswers() {
  if (interactive) return;
  const chunks = [];
  for await (const chunk of stdin) chunks.push(chunk);
  scripted = Buffer.concat(chunks).toString("utf8").split(/\r?\n/);
}

/* When the input ends — Ctrl-C, Ctrl-D, or the piped answers running out —
 * every remaining question answers itself with the current value, so the run
 * still finishes and writes a valid file. */
let inputEnded = false;
const ENDED = Symbol("input ended");
const whenEnded = new Promise((resolve) => {
  rl?.once("close", () => {
    inputEnded = true;
    resolve(ENDED);
  });
});

function closeInput() {
  if (rl && !inputEnded) rl.close();
}

/** Asks a question, offering `current` as the answer if Enter is pressed. */
async function ask(label, current = "") {
  const shown = current ? ` ${dim(`[${current}]`)}` : "";

  if (!interactive) {
    const next = scripted?.length ? scripted.shift() : undefined;
    if (next === undefined) inputEnded = true;
    const answer = next?.trim() ? next.trim() : current;
    say(`  ${label}${shown}`);
    say(`  ${rose("›")} ${answer}`);
    return answer;
  }

  if (inputEnded) return current;
  const answer = await Promise.race([
    rl.question(`  ${label}${shown}\n  ${rose("›")} `),
    whenEnded,
  ]);
  if (answer === ENDED) return current;
  const trimmed = answer.trim();
  return trimmed === "" ? current : trimmed;
}

/**
 * Asks for something optional. Enter keeps what's there; a single "-" removes
 * it, which is the only way to clear a field that already has text in it.
 */
async function askOptional(label, current) {
  const answer = await ask(`${label} ${dim('(Enter keeps it, "-" removes it)')}`, current ?? "");
  if (answer === "-") return undefined;
  return answer === "" ? undefined : answer;
}

/** Asks until the answer passes `check`, which returns an error string or null. */
async function askValid(label, current, check) {
  for (;;) {
    const answer = await ask(label, current);
    const problem = check(answer);
    if (!problem) return answer;
    say(`  ${gold("↳")} ${problem}`);
    if (inputEnded) return current;
  }
}

async function confirm(label, fallback = false) {
  if (inputEnded) return fallback;
  const hint = fallback ? "Y/n" : "y/N";
  const answer = (await ask(`${label} ${dim(`(${hint})`)}`, "")).toLowerCase();
  if (answer === "") return fallback;
  return answer.startsWith("y");
}

/** Collects a list of lines, finishing on a blank one. */
async function askLines(label, current) {
  say(`  ${label} ${dim("— one per line, blank line when you're done")}`);
  if (current.length > 0) {
    say(`  ${dim("Currently:")}`);
    for (const line of current) say(`  ${dim(`  · ${truncate(line, 68)}`)}`);
    if (!(await confirm("Replace these?", false))) return current;
  }
  const lines = [];
  for (;;) {
    if (inputEnded) break;
    const line = await ask(`${lines.length + 1}.`, "");
    if (line === "") break;
    lines.push(line);
  }
  return lines.length > 0 ? lines : current;
}

/** Collects a list of items, each built by `fields`, finishing on a blank first answer. */
async function askItems(label, current, fields, describe) {
  say(`  ${label} ${dim(`— ${current.length} at the moment`)}`);
  for (const item of current) say(`  ${dim(`  · ${truncate(describe(item), 68)}`)}`);
  if (!(await confirm("Write your own instead?", false))) return current;

  const items = [];
  for (;;) {
    if (inputEnded) break;
    say();
    const item = await fields(items.length + 1, current[items.length]);
    if (!item) break;
    items.push(item);
  }
  return items.length > 0 ? items : current;
}

const truncate = (text, max) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

/* ── Validation ──────────────────────────────────────────────────────────── */

function checkDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return "Use the form YYYY-MM-DD, e.g. 2026-11-09.";
  const [, year, month, day] = match.map(Number);
  const normalised = normalizeDay({ year, month, day });
  if (normalised.year !== year || normalised.month !== month || normalised.day !== day) {
    return "That isn't a real date — check the month and day.";
  }
  return null;
}

function checkTimeZone(value) {
  try {
    assertValidTimeZone(value);
    return null;
  } catch {
    return `"${value}" isn't a known time zone. Try a name like Asia/Dhaka or Europe/London.`;
  }
}

function checkCandles(value) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1 || number > 9)
    return "Pick a whole number from 1 to 9.";
  return null;
}

/**
 * Formats the file the same way `npm run format` would, so a file written by
 * the wizard is indistinguishable from a hand-edited one. Prettier ships with
 * the project; if it has been removed, the file is still perfectly valid.
 */
async function format(code, filepath) {
  try {
    const prettier = await import("prettier");
    const config = await prettier.resolveConfig(filepath);
    return await prettier.format(code, { ...config, filepath });
  } catch {
    return code;
  }
}

/* ── The questions ───────────────────────────────────────────────────────── */

async function main() {
  await readPipedAnswers();
  const content = structuredClone(birthday);
  const oldNames = {
    her: content.people.her.name,
    nickname: content.people.her.nickname,
    you: content.people.you.name,
  };

  say();
  say(`  ${bold(rose("A Little Universe"))} ${dim("— setup")}`);
  say(`  ${dim("─".repeat(52))}`);
  say(`  ${dim("Press Enter to keep what's shown in brackets.")}`);
  say(`  ${dim("Nothing is written until the very end.")}`);

  heading("Who it's for");
  const names = {
    her: await ask("Her name, as it should appear in the big headline", oldNames.her),
    nickname: await ask("What you call her", oldNames.nickname),
    you: await ask("Your name, for signing the letter", oldNames.you),
  };
  const templated = applyNames(content, oldNames, names);

  heading("The day");
  const { year, month, day } = content.date;
  const currentDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const date = await askValid("Her birthday (YYYY-MM-DD)", currentDate, checkDate);
  const [newYear, newMonth, newDay] = date.split("-").map(Number);
  content.date.year = newYear;
  content.date.month = newMonth;
  content.date.day = newDay;

  const systemZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  say(`  ${dim(`Your computer is set to ${systemZone}.`)}`);
  content.date.timeZone = await askValid(
    "Which time zone should the countdown follow?",
    content.date.timeZone,
    checkTimeZone,
  );
  say(`  ${gold("↳")} the countdown will reach zero at midnight in ${content.date.timeZone}.`);

  const full = await confirm("\n  Go through every section's words too?", false);

  if (full) {
    heading("The opening screen");
    content.hero.greeting = await ask("Greeting above her name", content.hero.greeting);
    content.hero.subtitle = await ask("The line underneath", content.hero.subtitle);

    heading("The letter");
    content.letter.greeting = await ask("How the letter opens", content.letter.greeting);
    templated.delete("letter.greeting");
    content.letter.paragraphs = await askLines("The letter itself", content.letter.paragraphs);
    content.letter.closing = await ask("Closing line", content.letter.closing);
    content.letter.postscript = await askOptional("P.S.", content.letter.postscript);

    heading("Things you adore about her");
    content.adore.reasons = await askItems(
      "Your reasons",
      content.adore.reasons,
      async (index, existing) => {
        const title = await ask(`Reason ${index} — short title (blank to stop)`, "");
        if (title === "") return null;
        const message = await ask("  …and why", existing?.message ?? "");
        return { title, message, icon: existing?.icon ?? "heart" };
      },
      (reason) => reason.title,
    );

    heading("Your story");
    content.story.moments = await askItems(
      "The moments in your timeline",
      content.story.moments,
      async (index, existing) => {
        const title = await ask(`Moment ${index} — title (blank to stop)`, "");
        if (title === "") return null;
        const when = await ask("  When was it?", existing?.when ?? "");
        const description = await ask("  What happened", existing?.description ?? "");
        return {
          title,
          when: when === "" ? undefined : when,
          description,
          icon: existing?.icon ?? "heart",
        };
      },
      (moment) => `${moment.when ? `${moment.when} — ` : ""}${moment.title}`,
    );

    heading("“Open when…” notes");
    content.notes.notes = await askItems(
      "Your notes",
      content.notes.notes,
      async (index, existing) => {
        const label = await ask(`Note ${index} — what's on the envelope (blank to stop)`, "");
        if (label === "") return null;
        const message = await ask("  …and what's inside", existing?.message ?? "");
        return { label, message };
      },
      (note) => note.label,
    );

    heading("Pick a surprise");
    for (const choice of content.choose.choices) {
      say(`  ${dim(choice.label)}`);
      choice.title = await ask("  Heading", choice.title);
      choice.message = await ask("  Message", choice.message);
      if (choice.bonus) {
        choice.bonus.reveal = await ask("  The second reveal", choice.bonus.reveal);
      }
    }

    heading("The cake");
    content.cake.candles = Number(
      await askValid("How many candles", String(content.cake.candles), checkCandles),
    );
    content.cake.celebrationMessage = await ask(
      "What she reads after blowing them out",
      content.cake.celebrationMessage,
    );

    heading("The final reveal");
    content.finale.dedication = await askLines("Your dedication", content.finale.dedication);
    content.finale.promise = await askOptional("A promise, in your words", content.finale.promise);
    content.finale.closing = await ask("The very last line", content.finale.closing);

    heading("The footer");
    content.footer.message = await ask("Sign-off", content.footer.message);
  }

  closeInput();

  /* ── Write it out ──────────────────────────────────────────────────────── */
  const file = await format(renderContentFile(content, templated), CONTENT_FILE);

  const backup = `${CONTENT_FILE}.bak`;
  await copyFile(CONTENT_FILE, backup);
  await writeFile(CONTENT_FILE, file, "utf8");

  say();
  say(`  ${gold("✓")} Wrote ${bold(relative(ROOT, CONTENT_FILE).replaceAll("\\", "/"))}`);
  say(`  ${dim(`  previous version kept as ${relative(ROOT, backup).replaceAll("\\", "/")}`)}`);
  say();
  say(`  ${bold("Next")}`);
  say(`    1. ${bold("npm run dev")} — see it at http://localhost:3000`);
  say(`    2. Add your photos to public/images ${dim("(see public/images/README.md)")}`);
  say(`    3. ${bold("npm run check")} — make sure everything still passes`);
  if (!full) {
    say();
    say(`  ${dim("Run `npm run setup` again and answer yes to the")}`);
    say(`  ${dim('"every section" question to write the rest of the words.')}`);
  }
  say();
}

main().catch((error) => {
  closeInput();
  say();
  say(`  Something went wrong, and nothing was written:`);
  say(`  ${error.message}`);
  process.exitCode = 1;
});
