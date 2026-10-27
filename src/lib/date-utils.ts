/**
 * Time-zone–aware birthday maths.
 *
 * Everything here works with absolute instants (milliseconds since the Unix
 * epoch), so the countdown is identical for every visitor no matter which
 * time zone their device is set to, and daylight-saving changes on the
 * visitor's side cannot skew it. The birthday itself is defined as a
 * calendar day in the celebration's time zone (e.g. Asia/Dhaka).
 */

export const SECOND_MS = 1000;
export const MINUTE_MS = 60 * SECOND_MS;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;

export interface CalendarDay {
  year: number;
  /** 1–12 */
  month: number;
  day: number;
}

export interface BirthdayWindow {
  /** First instant of the birthday in the celebration time zone. */
  start: number;
  /** First instant of the following day. */
  end: number;
}

export interface DurationParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export type BirthdayPhase =
  | { phase: "upcoming"; remainingMs: number; parts: DurationParts }
  | { phase: "birthday" }
  | { phase: "after" };

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatterCache.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    formatterCache.set(timeZone, formatter);
  }
  return formatter;
}

/** Throws a RangeError if `timeZone` is not a valid IANA time zone. */
export function assertValidTimeZone(timeZone: string): void {
  getFormatter(timeZone);
}

interface WallClock extends CalendarDay {
  hour: number;
  minute: number;
  second: number;
}

/** The wall-clock reading in `timeZone` at the given instant. */
export function getWallClock(instant: number, timeZone: string): WallClock {
  const parts = getFormatter(timeZone).formatToParts(new Date(instant));
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);
  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour") % 24,
    minute: read("minute"),
    second: read("second"),
  };
}

/** Offset of `timeZone` from UTC (in ms) at the given instant. */
export function getTimeZoneOffset(instant: number, timeZone: string): number {
  const wall = getWallClock(instant, timeZone);
  const wallAsUtc = Date.UTC(
    wall.year,
    wall.month - 1,
    wall.day,
    wall.hour,
    wall.minute,
    wall.second,
  );
  const wholeSecond = Math.floor(instant / SECOND_MS) * SECOND_MS;
  return wallAsUtc - wholeSecond;
}

function isSameDay(a: CalendarDay, b: CalendarDay): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

/** Normalises overflowing values, e.g. { month: 12, day: 32 } → Jan 1 next year. */
export function normalizeDay(day: CalendarDay): CalendarDay {
  const date = new Date(Date.UTC(day.year, day.month - 1, day.day));
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

/**
 * The first instant of a calendar day in `timeZone`.
 *
 * Normally that is local midnight. In zones whose daylight-saving change
 * happens at midnight, midnight may not exist (the day starts at 01:00) or
 * may happen twice; this always returns the earliest instant whose local
 * date is the requested day.
 */
export function startOfDayInTimeZone(day: CalendarDay, timeZone: string): number {
  const target = normalizeDay(day);
  const wallMidnight = Date.UTC(target.year, target.month - 1, target.day);

  // Offsets in effect around the target day. Transitions never happen more
  // than once in this window, so the true start must use one of them.
  const offsets = new Set([
    getTimeZoneOffset(wallMidnight - DAY_MS, timeZone),
    getTimeZoneOffset(wallMidnight, timeZone),
    getTimeZoneOffset(wallMidnight + DAY_MS, timeZone),
  ]);

  const candidates = [...offsets]
    .map((offset) => wallMidnight - offset)
    .filter((instant) => isSameDay(getWallClock(instant, timeZone), target))
    .sort((a, b) => a - b);

  const [earliest] = candidates;
  if (earliest !== undefined) return earliest;

  // Defensive fallback; not reachable for real IANA zones.
  return wallMidnight - getTimeZoneOffset(wallMidnight, timeZone);
}

/** The birthday as an absolute [start, end) interval. */
export function getBirthdayWindow(day: CalendarDay, timeZone: string): BirthdayWindow {
  const start = startOfDayInTimeZone(day, timeZone);
  const end = startOfDayInTimeZone({ ...day, day: day.day + 1 }, timeZone);
  return { start, end };
}

/** Splits a non-negative duration into whole days, hours, minutes and seconds. */
export function splitDuration(ms: number): DurationParts {
  const total = Math.max(0, Math.floor(ms / SECOND_MS));
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3_600),
    minutes: Math.floor((total % 3_600) / 60),
    seconds: total % 60,
  };
}

/** Where `now` sits relative to the birthday window. */
export function getBirthdayPhase(now: number, window: BirthdayWindow): BirthdayPhase {
  if (now < window.start) {
    const remainingMs = window.start - now;
    // Like any countdown, round partial seconds up: it reads 00:00:01 during
    // the final second and reaches zero exactly at midnight, never skipping.
    const wholeSeconds = Math.ceil(remainingMs / SECOND_MS) * SECOND_MS;
    return { phase: "upcoming", remainingMs, parts: splitDuration(wholeSeconds) };
  }
  if (now < window.end) return { phase: "birthday" };
  return { phase: "after" };
}

/** "November 9" — formatted without depending on the visitor's time zone. */
export function formatMonthDay(day: CalendarDay, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(day.year, day.month - 1, day.day)));
}

/** "November 9, 2026" — formatted without depending on the visitor's time zone. */
export function formatFullDate(day: CalendarDay, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(day.year, day.month - 1, day.day)));
}

/** "2026-11-09" for <time dateTime>. */
export function toIsoDate(day: CalendarDay): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${day.year}-${pad(day.month)}-${pad(day.day)}`;
}
