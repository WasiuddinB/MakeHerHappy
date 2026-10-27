import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BirthdayCake } from "@/components/birthday/BirthdayCake";
import { ChooseYourSurprise } from "@/components/birthday/ChooseYourSurprise";
import { FinalReveal } from "@/components/birthday/FinalReveal";
import { SurpriseNotes } from "@/components/birthday/SurpriseNotes";
import { birthday } from "@/content/birthday";

const { notes, choose, cake, finale } = birthday;

describe("SurpriseNotes", () => {
  it("opens a note, offers another, and remembers which were opened", async () => {
    const user = userEvent.setup();
    render(<SurpriseNotes notes={notes.notes} signOff={notes.signOff} />);
    expect(screen.getByText(`0 of ${notes.notes.length} opened`)).toBeInTheDocument();

    const [first, second] = notes.notes;
    const firstEnvelope = screen.getByRole("button", { name: new RegExp(first.label) });
    await user.click(firstEnvelope);

    const dialog = document.querySelector("dialog")!;
    expect(dialog).toHaveAttribute("open");
    expect(within(dialog).getByRole("heading", { name: first.label })).toBeInTheDocument();
    expect(within(dialog).getByText(first.message)).toBeInTheDocument();
    expect(within(dialog).getByText(notes.signOff)).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: /open another/i }));
    expect(within(dialog).getByRole("heading", { name: second.label })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: /open another/i })).toHaveFocus();

    await user.click(within(dialog).getByRole("button", { name: /fold it back/i }));
    expect(dialog).not.toHaveAttribute("open");
    expect(screen.getByText(`2 of ${notes.notes.length} opened`)).toBeInTheDocument();
    expect(firstEnvelope).toHaveAccessibleName(expect.stringContaining("already opened"));
  });

  it("closes with Escape and returns focus to the envelope", async () => {
    const user = userEvent.setup();
    render(<SurpriseNotes notes={notes.notes} signOff={notes.signOff} />);
    const envelope = screen.getByRole("button", { name: new RegExp(notes.notes[2].label) });
    await user.click(envelope);
    await user.keyboard("{Escape}");
    expect(document.querySelector("dialog")).not.toHaveAttribute("open");
    expect(envelope).toHaveFocus();
  });
});

describe("ChooseYourSurprise", () => {
  it("reveals a surprise, its bonus, and returns to the other choices", async () => {
    const user = userEvent.setup();
    render(<ChooseYourSurprise {...choose} />);
    const funny = choose.choices.find((choice) => choice.id === "funny")!;

    await user.click(screen.getByRole("button", { name: new RegExp(funny.label) }));
    const title = await screen.findByRole("heading", { name: funny.title });
    expect(title).toHaveFocus();
    expect(screen.getByText(funny.message)).toBeInTheDocument();

    const bonus = screen.getByRole("button", { name: funny.bonus!.prompt });
    expect(bonus).toHaveAttribute("aria-expanded", "false");
    await user.click(bonus);
    expect(bonus).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(funny.bonus!.reveal)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: new RegExp(choose.backLabel) }));
    const funnyAgain = await screen.findByRole("button", { name: new RegExp(funny.label) });
    expect(funnyAgain).toHaveFocus();
    expect(within(funnyAgain).getByText("Opened")).toBeInTheDocument();
  });

  it("celebrates once every surprise has been opened", async () => {
    const user = userEvent.setup();
    render(<ChooseYourSurprise {...choose} />);
    for (const choice of choose.choices) {
      await user.click(await screen.findByRole("button", { name: new RegExp(choice.label) }));
      await user.click(await screen.findByRole("button", { name: new RegExp(choose.backLabel) }));
    }
    expect(await screen.findByText(choose.allDoneMessage)).toBeInTheDocument();
  });
});

describe("BirthdayCake", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("blows candles out one at a time", () => {
    render(<BirthdayCake cake={cake} />);
    const candles = screen.getAllByRole("button", { name: /^Candle/ });
    expect(candles).toHaveLength(cake.candles);

    fireEvent.click(candles[0]);
    expect(candles[0]).toHaveAttribute("aria-disabled", "true");
    expect(
      screen.getByText(`${cake.candles - 1} of ${cake.candles} candles lit`),
    ).toBeInTheDocument();

    candles.slice(1).forEach((candle) => fireEvent.click(candle));
    expect(screen.getByRole("heading", { name: cake.celebrationTitle })).toHaveFocus();
  });

  it("celebrates after the button blows them all out, can be repeated, and cleans up", () => {
    // Only fake what the cake uses, so the count below is the cake's own timers
    // (React schedules its internal work with setImmediate).
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
    const { unmount } = render(<BirthdayCake cake={cake} />);

    fireEvent.click(screen.getByRole("button", { name: cake.blowLabel }));
    act(() => {
      vi.advanceTimersByTime(3_000);
    });
    expect(screen.getByRole("heading", { name: cake.celebrationTitle })).toHaveFocus();
    expect(screen.getByText(cake.celebrationMessage)).toBeInTheDocument();
    for (const candle of screen.getAllByRole("button", { name: /^Candle/ })) {
      expect(candle).toHaveAttribute("aria-disabled", "true");
    }

    fireEvent.click(screen.getByRole("button", { name: cake.relightLabel }));
    expect(screen.getByRole("button", { name: cake.blowLabel })).toHaveFocus();
    for (const candle of screen.getAllByRole("button", { name: /^Candle/ })) {
      expect(candle).toHaveAttribute("aria-disabled", "false");
    }

    // Start another round, then leave mid-way: nothing may keep running.
    fireEvent.click(screen.getByRole("button", { name: cake.blowLabel }));
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    expect(document.querySelector("canvas")).toBeNull();
  });
});

describe("FinalReveal", () => {
  it("reveals the dedication and moves focus to it", async () => {
    const user = userEvent.setup();
    render(<FinalReveal finale={finale} chapter={9} />);
    expect(screen.queryByText(finale.dedication[0])).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: finale.buttonLabel }));
    expect(screen.getByRole("heading", { name: finale.title })).toHaveFocus();
    for (const paragraph of finale.dedication) {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    }
    expect(screen.getByText(finale.signature)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: new RegExp(finale.returnLabel) })).toHaveAttribute(
      "href",
      "#top",
    );
  });
});
