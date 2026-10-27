import { act, render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BirthdayCountdown } from "@/components/birthday/BirthdayCountdown";
import { birthday } from "@/content/birthday";
import { getBirthdayWindow } from "@/lib/date-utils";

const { start, end } = getBirthdayWindow(birthday.date, birthday.date.timeZone);
const props = {
  start,
  end,
  content: birthday.countdown,
  dateLabel: "November 9, 2026",
  zoneLabel: "Dhaka",
  cakeTarget: "cake",
};
const { upcoming, birthday: onTheDay, after } = birthday.countdown;

const tile = (unit: string) =>
  within(screen.getByRole("timer")).getByText(unit).closest("div")?.querySelector("dd")
    ?.textContent;

describe("BirthdayCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("counts down in days, hours, minutes and seconds before the birthday", () => {
    vi.setSystemTime(new Date("2026-10-26T12:00:00.000Z"));
    render(<BirthdayCountdown {...props} />);

    expect(screen.getByRole("heading", { name: upcoming.title })).toBeInTheDocument();
    expect(tile("days")).toBe("13");
    expect(tile("hours")).toBe("06");
    expect(tile("minutes")).toBe("00");
    expect(tile("seconds")).toBe("00");
  });

  it("updates every second without a reload", () => {
    vi.setSystemTime(new Date("2026-10-26T12:00:00.000Z"));
    render(<BirthdayCountdown {...props} />);
    act(() => {
      vi.advanceTimersByTime(1_010);
    });
    expect(tile("hours")).toBe("05");
    expect(tile("minutes")).toBe("59");
    expect(tile("seconds")).toBe("59");
  });

  it("switches to the birthday message at midnight in Dhaka", () => {
    vi.setSystemTime(start - 2_000);
    render(<BirthdayCountdown {...props} />);
    expect(screen.getByRole("heading", { name: upcoming.title })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2_100);
    });
    expect(screen.getByRole("heading", { name: onTheDay.title })).toBeInTheDocument();
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /make a birthday wish/i })).toHaveAttribute(
      "href",
      "#cake",
    );
  });

  it("shows the birthday message all day long", () => {
    vi.setSystemTime(end - 1);
    render(<BirthdayCountdown {...props} />);
    expect(screen.getByRole("heading", { name: onTheDay.title })).toBeInTheDocument();
  });

  it("never shows a countdown once the birthday has passed", () => {
    vi.setSystemTime(end + 90 * 24 * 60 * 60 * 1000);
    render(<BirthdayCountdown {...props} />);
    expect(screen.getByRole("heading", { name: after.title })).toBeInTheDocument();
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
    expect(screen.queryByText(upcoming.message)).not.toBeInTheDocument();
  });

  it("renders a neutral, date-independent state on the server", () => {
    const html = renderToString(<BirthdayCountdown {...props} />);
    expect(html).toContain(birthday.countdown.navLabel);
    expect(html).toContain("––");
    expect(html).not.toContain(upcoming.title);
    expect(html).not.toContain(onTheDay.title);
    expect(html).not.toContain(after.title);
  });

  it("stops its timer when it unmounts", () => {
    vi.setSystemTime(new Date("2026-10-26T12:00:00.000Z"));
    const { unmount } = render(<BirthdayCountdown {...props} />);
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
