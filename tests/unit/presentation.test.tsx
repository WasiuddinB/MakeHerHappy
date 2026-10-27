import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ExperienceProvider } from "@/components/layout/Experience";
import { PresentationBar } from "@/components/layout/PresentationBar";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { birthday } from "@/content/birthday";
import { createShareCard } from "@/lib/qr";
import { getSections } from "@/lib/sections";

const sections = getSections(birthday);

function renderSite({ withShare = false, music = null as typeof birthday.music | null } = {}) {
  return render(
    <ExperienceProvider
      sections={sections}
      music={music ?? null}
      share={withShare ? createShareCard(new URL("https://our-little-universe.vercel.app")) : null}
      presentationCopy={birthday.presentation}
    >
      <SiteHeader brand="for Sweetheart" />
      <main>
        {sections.map((section) => (
          <section key={section.id} id={section.id} data-section>
            <h2 data-section-heading tabIndex={-1}>
              {section.label}
            </h2>
          </section>
        ))}
      </main>
      <PresentationBar />
    </ExperienceProvider>,
  );
}

const toolbar = () => screen.getByRole("toolbar", { name: "Presentation controls" });

afterEach(() => {
  window.history.replaceState(null, "", "/");
});

describe("presentation mode", () => {
  it("enters from the header, steps through chapters and exits with Escape", async () => {
    const user = userEvent.setup();
    renderSite();
    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Present on a big screen" }));
    expect(document.documentElement).toHaveAttribute("data-presentation");
    expect(within(toolbar()).getByText(`1 / ${sections.length}`)).toBeInTheDocument();
    expect(within(toolbar()).getByRole("button", { name: "Next chapter" })).toHaveFocus();

    await user.click(within(toolbar()).getByRole("button", { name: "Next chapter" }));
    expect(within(toolbar()).getByText(`2 / ${sections.length}`)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: sections[1].label })).toHaveFocus();

    // Keyboard and presentation clickers (PageDown / PageUp).
    await user.keyboard("{ArrowRight}");
    expect(within(toolbar()).getByText(`3 / ${sections.length}`)).toBeInTheDocument();
    await user.keyboard("{PageDown}");
    expect(within(toolbar()).getByText(`4 / ${sections.length}`)).toBeInTheDocument();
    await user.keyboard("{PageUp}{ArrowLeft}");
    expect(within(toolbar()).getByText(`2 / ${sections.length}`)).toBeInTheDocument();
    await user.keyboard("{End}");
    expect(
      within(toolbar()).getByText(`${sections.length} / ${sections.length}`),
    ).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(document.documentElement).not.toHaveAttribute("data-presentation");
    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
  });

  it("has an Exit button that restores the normal layout", async () => {
    const user = userEvent.setup();
    renderSite();
    await user.click(screen.getByRole("button", { name: "Present on a big screen" }));
    await user.click(within(toolbar()).getByRole("button", { name: /exit/i }));
    expect(document.documentElement).not.toHaveAttribute("data-presentation");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Present on a big screen" })).toHaveFocus(),
    );
  });

  it("starts in presentation mode when the link ends in ?present", () => {
    window.history.replaceState(null, "", "/?present");
    renderSite();
    expect(document.documentElement).toHaveAttribute("data-presentation");
    expect(toolbar()).toBeInTheDocument();
  });

  it("explains gently when the browser refuses full screen", async () => {
    const user = userEvent.setup();
    Object.defineProperty(document, "fullscreenEnabled", { configurable: true, value: true });
    document.documentElement.requestFullscreen = vi.fn().mockRejectedValue(new Error("denied"));
    try {
      renderSite();
      await user.click(screen.getByRole("button", { name: "Present on a big screen" }));
      await user.click(within(toolbar()).getByRole("button", { name: "Full screen" }));
      expect(await screen.findByRole("status")).toHaveTextContent(/isn’t available/);
      // Presentation mode itself keeps working.
      expect(document.documentElement).toHaveAttribute("data-presentation");
    } finally {
      Object.defineProperty(document, "fullscreenEnabled", { configurable: true, value: false });
    }
  });

  it("hides the full-screen button where the browser can't do it", async () => {
    const user = userEvent.setup();
    renderSite();
    await user.click(screen.getByRole("button", { name: "Present on a big screen" }));
    expect(
      within(toolbar()).queryByRole("button", { name: "Full screen" }),
    ).not.toBeInTheDocument();
  });

  it("shows a share QR code only when a public URL is known", async () => {
    const user = userEvent.setup();
    const { unmount } = renderSite();
    await user.click(screen.getByRole("button", { name: "Present on a big screen" }));
    expect(within(toolbar()).queryByRole("button", { name: /QR code/ })).not.toBeInTheDocument();
    unmount();

    renderSite({ withShare: true });
    await user.click(screen.getByRole("button", { name: "Present on a big screen" }));
    await user.click(within(toolbar()).getByRole("button", { name: /QR code/ }));
    expect(
      screen.getByRole("img", { name: "QR code that opens our-little-universe.vercel.app" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: birthday.presentation.shareHeading }),
    ).toBeInTheDocument();
  });
});

describe("chapter menu", () => {
  it("lists every chapter and jumps to the chosen one", async () => {
    const user = userEvent.setup();
    const scrollIntoView = vi.spyOn(Element.prototype, "scrollIntoView");
    renderSite();

    await user.click(screen.getByRole("button", { name: "Chapters" }));
    const menu = screen.getByRole("navigation", { name: "Chapters" });
    const links = within(menu).getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual(
      sections.map(
        (section) =>
          `${section.chapter === null ? "✦" : String(section.chapter).padStart(2, "0")}${section.label}`,
      ),
    );

    await user.click(within(menu).getByRole("link", { name: /Our story/ }));
    await waitFor(() => expect(screen.getByRole("heading", { name: "Our story" })).toHaveFocus());
    expect(scrollIntoView).toHaveBeenCalled();
    expect(document.querySelector("dialog")).not.toHaveAttribute("open");
  });

  it("offers presentation mode from the menu too", async () => {
    const user = userEvent.setup();
    renderSite();
    await user.click(screen.getByRole("button", { name: "Chapters" }));
    await user.click(screen.getByRole("button", { name: /birthday presentation mode/i }));
    await waitFor(() => expect(document.documentElement).toHaveAttribute("data-presentation"));
  });
});

describe("music", () => {
  it("only appears when a song is configured, and never plays on its own", () => {
    const { unmount } = renderSite();
    expect(screen.queryByRole("button", { name: /^Music/ })).not.toBeInTheDocument();
    unmount();

    renderSite({ music: { src: "/audio/our-song.mp3", title: "Our song" } });
    const toggle = screen.getByRole("button", { name: "Music: Our song" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    const audio = document.querySelector("audio")!;
    expect(audio).toHaveAttribute("preload", "none");
    expect(audio.autoplay).toBe(false);
  });
});
