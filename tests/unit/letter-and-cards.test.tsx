import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdorationCards } from "@/components/birthday/AdorationCards";
import { LoveLetter } from "@/components/birthday/LoveLetter";
import { birthday } from "@/content/birthday";

const { letter, adore } = birthday;

describe("LoveLetter", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("opens the envelope, reveals the whole letter and moves focus to it", () => {
    vi.useFakeTimers();
    render(<LoveLetter letter={letter} dateLabel="November 9, 2026" isoDate="2026-11-09" />);

    fireEvent.click(screen.getByRole("button", { name: letter.openLabel }));
    // The seal breaks and the flap opens first…
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1_200);
    });

    const article = screen.getByRole("article", { name: letter.greeting });
    expect(article).toHaveFocus();
    for (const paragraph of letter.paragraphs) {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    }
    expect(screen.getByText(letter.signature)).toBeInTheDocument();
  });

  it("opens instantly for people who prefer reduced motion, and folds back up", async () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches: query.includes("reduce"),
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
        }) as unknown as MediaQueryList,
    );
    const user = userEvent.setup();
    render(<LoveLetter letter={letter} dateLabel="November 9, 2026" isoDate="2026-11-09" />);

    await user.click(screen.getByRole("button", { name: letter.openLabel }));
    expect(screen.getByRole("article", { name: letter.greeting })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /fold the letter/i }));
    expect(screen.getByRole("button", { name: letter.openLabel })).toHaveFocus();
  });
});

describe("AdorationCards", () => {
  const [first, second] = adore.reasons;

  it("turns a card over to reveal its message and keeps focus on the visible side", async () => {
    const user = userEvent.setup();
    render(<AdorationCards reasons={adore.reasons} />);

    const read = screen.getByRole("button", { name: `Read why: ${first.title}` });
    expect(read.closest("li")).toHaveAttribute("data-flipped", "false");

    await user.click(read);
    const turnBack = screen.getByRole("button", { name: `Turn back: ${first.title}` });
    expect(read.closest("li")).toHaveAttribute("data-flipped", "true");
    expect(turnBack).toHaveFocus();
    expect(screen.getByText(first.message)).toBeInTheDocument();

    await user.click(turnBack);
    expect(read.closest("li")).toHaveAttribute("data-flipped", "false");
    expect(read).toHaveFocus();
  });

  it("reveals and hides every card at once", async () => {
    const user = userEvent.setup();
    render(<AdorationCards reasons={adore.reasons} />);

    const toggle = screen.getByRole("button", { name: /reveal them all/i });
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    const cards = screen.getAllByRole("listitem");
    expect(cards).toHaveLength(adore.reasons.length);
    for (const card of cards) expect(card).toHaveAttribute("data-flipped", "true");

    await user.click(screen.getByRole("button", { name: /turn them all back/i }));
    for (const card of cards) expect(card).toHaveAttribute("data-flipped", "false");
    // Focus stays on the toggle rather than jumping into a card.
    expect(screen.getByRole("button", { name: /reveal them all/i })).toHaveFocus();
    expect(screen.getByRole("button", { name: `Read why: ${second.title}` })).toBeInTheDocument();
  });

  it("shows the same layout on every visit (nothing random)", () => {
    const { container: a } = render(<AdorationCards reasons={adore.reasons} />);
    const { container: b } = render(<AdorationCards reasons={adore.reasons} />);
    expect(a.innerHTML).toBe(b.innerHTML);
  });
});
