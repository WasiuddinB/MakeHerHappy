import { afterEach, describe, expect, it } from "vitest";
import {
  DAY_MS,
  HOUR_MS,
  assertValidTimeZone,
  formatFullDate,
  formatMonthDay,
  getBirthdayPhase,
  getBirthdayWindow,
  getWallClock,
  normalizeDay,
  splitDuration,
  startOfDayInTimeZone,
  toIsoDate,
  type CalendarDay,
} from "@/lib/date-utils";

const BIRTHDAY: CalendarDay = { year: 2026, month: 11, day: 9 };
const DHAKA = "Asia/Dhaka";
const iso = (instant: number) => new Date(instant).toISOString();

describe("startOfDayInTimeZone", () => {
  it("puts the birthday at midnight in Dhaka (UTC+6)", () => {
    expect(iso(startOfDayInTimeZone(BIRTHDAY, DHAKA))).toBe("2026-11-08T18:00:00.000Z");
  });

  it("handles fixed offsets that are not whole hours", () => {
    expect(iso(startOfDayInTimeZone(BIRTHDAY, "Asia/Kolkata"))).toBe("2026-11-08T18:30:00.000Z");
    expect(iso(startOfDayInTimeZone(BIRTHDAY, "Asia/Kathmandu"))).toBe("2026-11-08T18:15:00.000Z");
    expect(iso(startOfDayInTimeZone(BIRTHDAY, "UTC"))).toBe("2026-11-09T00:00:00.000Z");
  });

  // Days around 2026 daylight-saving changes, including zones where the
  // change happens at midnight (so local midnight is skipped or repeated).
  const cases: Array<[string, CalendarDay]> = [
    ["America/New_York", { year: 2026, month: 3, day: 8 }],
    ["America/New_York", { year: 2026, month: 11, day: 1 }],
    ["Europe/London", { year: 2026, month: 3, day: 29 }],
    ["Europe/London", { year: 2026, month: 10, day: 25 }],
    ["Australia/Sydney", { year: 2026, month: 4, day: 5 }],
    ["Australia/Sydney", { year: 2026, month: 10, day: 4 }],
    ["America/Havana", { year: 2026, month: 3, day: 8 }],
    ["America/Havana", { year: 2026, month: 11, day: 1 }],
    ["America/Santiago", { year: 2026, month: 4, day: 5 }],
    ["America/Santiago", { year: 2026, month: 9, day: 6 }],
    ["Asia/Beirut", { year: 2026, month: 3, day: 29 }],
    ["Asia/Beirut", { year: 2026, month: 10, day: 25 }],
    ["Pacific/Chatham", { year: 2026, month: 4, day: 5 }],
    [DHAKA, BIRTHDAY],
  ];

  it.each(cases)("finds the first instant of the day in %s (%o)", (timeZone, day) => {
    const start = startOfDayInTimeZone(day, timeZone);
    const local = getWallClock(start, timeZone);
    const before = getWallClock(start - 1, timeZone);
    const previous = normalizeDay({ ...day, day: day.day - 1 });

    expect({ year: local.year, month: local.month, day: local.day }).toEqual(day);
    expect({ year: before.year, month: before.month, day: before.day }).toEqual(previous);
  });
});

describe("getBirthdayWindow", () => {
  it("spans the whole birthday in Dhaka", () => {
    const window = getBirthdayWindow(BIRTHDAY, DHAKA);
    expect(iso(window.start)).toBe("2026-11-08T18:00:00.000Z");
    expect(iso(window.end)).toBe("2026-11-09T18:00:00.000Z");
    expect(window.end - window.start).toBe(DAY_MS);
  });

  it("is 23 or 25 hours long on daylight-saving days", () => {
    const spring = getBirthdayWindow({ year: 2026, month: 3, day: 8 }, "America/New_York");
    const autumn = getBirthdayWindow({ year: 2026, month: 11, day: 1 }, "America/New_York");
    expect(spring.end - spring.start).toBe(23 * HOUR_MS);
    expect(autumn.end - autumn.start).toBe(25 * HOUR_MS);
  });

  it("rolls over month and year boundaries", () => {
    const newYearsEve = getBirthdayWindow({ year: 2026, month: 12, day: 31 }, DHAKA);
    expect(iso(newYearsEve.end)).toBe("2026-12-31T18:00:00.000Z");
  });

  describe("does not depend on the visitor's own time zone", () => {
    const originalTz = process.env.TZ;
    afterEach(() => {
      process.env.TZ = originalTz;
    });

    it.each(["America/Los_Angeles", "Europe/Berlin", "Pacific/Kiritimati", "Asia/Dhaka"])(
      "same window when the device is set to %s",
      (deviceZone) => {
        process.env.TZ = deviceZone;
        const window = getBirthdayWindow(BIRTHDAY, DHAKA);
        expect(iso(window.start)).toBe("2026-11-08T18:00:00.000Z");
        expect(iso(window.end)).toBe("2026-11-09T18:00:00.000Z");
      },
    );
  });
});

describe("getBirthdayPhase", () => {
  const window = getBirthdayWindow(BIRTHDAY, DHAKA);

  it("counts down with whole days, hours, minutes and seconds", () => {
    const now = Date.parse("2026-10-26T12:00:00.000Z");
    expect(getBirthdayPhase(now, window)).toEqual({
      phase: "upcoming",
      remainingMs: window.start - now,
      parts: { days: 13, hours: 6, minutes: 0, seconds: 0 },
    });
  });

  it("rounds partial seconds up, so it reads 00:00:01 throughout the final second", () => {
    for (const msLeft of [1_000, 500, 1]) {
      expect(getBirthdayPhase(window.start - msLeft, window)).toMatchObject({
        phase: "upcoming",
        parts: { days: 0, hours: 0, minutes: 0, seconds: 1 },
      });
    }
  });

  it("never skips a second between ticks", () => {
    // A tick that lands a few milliseconds after a whole second.
    const now = Date.parse("2026-10-26T12:00:01.005Z");
    expect(getBirthdayPhase(now, window)).toMatchObject({
      parts: { days: 13, hours: 5, minutes: 59, seconds: 59 },
    });
  });

  it("is the birthday from exactly midnight in Dhaka until the next midnight", () => {
    expect(getBirthdayPhase(window.start, window).phase).toBe("birthday");
    expect(getBirthdayPhase(window.start + 12 * HOUR_MS, window).phase).toBe("birthday");
    expect(getBirthdayPhase(window.end - 1, window).phase).toBe("birthday");
  });

  it("never counts down again once the day has passed", () => {
    expect(getBirthdayPhase(window.end, window).phase).toBe("after");
    expect(getBirthdayPhase(window.end + 400 * DAY_MS, window).phase).toBe("after");
  });
});

describe("splitDuration", () => {
  it("splits milliseconds into parts", () => {
    expect(splitDuration(DAY_MS + HOUR_MS + 61_000 + 999)).toEqual({
      days: 1,
      hours: 1,
      minutes: 1,
      seconds: 1,
    });
  });

  it("never returns negative values", () => {
    expect(splitDuration(-5_000)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  });
});

describe("formatting", () => {
  it("formats the birthday independently of the device time zone", () => {
    expect(formatMonthDay(BIRTHDAY)).toBe("November 9");
    expect(formatFullDate(BIRTHDAY)).toBe("November 9, 2026");
    expect(toIsoDate(BIRTHDAY)).toBe("2026-11-09");
  });

  it("rejects unknown time zones", () => {
    expect(() => assertValidTimeZone("Mars/Olympus_Mons")).toThrow(RangeError);
    expect(() => assertValidTimeZone(DHAKA)).not.toThrow();
  });
});
