import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryGallery } from "@/components/birthday/MemoryGallery";
import { StorySection } from "@/components/birthday/StorySection";
import { SmartImage } from "@/components/ui/SmartImage";
import { birthday } from "@/content/birthday";
import type { BirthdayContent, GalleryPhoto } from "@/content/types";

const photos = birthday.gallery.photos;

function openViewer() {
  const dialog = document.querySelector("dialog");
  if (!dialog) throw new Error("dialog missing");
  return dialog;
}

describe("MemoryGallery", () => {
  it("shows clearly labelled placeholders until real photos are added", () => {
    render(<MemoryGallery photos={photos} />);
    const buttons = screen.getAllByRole("button", { name: /open larger/ });
    expect(buttons).toHaveLength(photos.length);
    expect(screen.getAllByText("Your photo here")).toHaveLength(photos.length);
    expect(screen.queryByRole("img", { name: /couldn’t be loaded/ })).not.toBeInTheDocument();
  });

  it("opens a viewer that navigates with the keyboard, wraps around and closes with Escape", async () => {
    const user = userEvent.setup();
    render(<MemoryGallery photos={photos} />);
    const [firstThumb] = screen.getAllByRole("button", { name: /open larger/ });

    await user.click(firstThumb);
    const dialog = openViewer();
    expect(dialog).toHaveAttribute("open");
    expect(within(dialog).getByText(`Photo 1 of ${photos.length}`)).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Close photo viewer" })).toHaveFocus();
    // Background scrolling is locked while the viewer is open.
    expect(document.documentElement.style.overflow).toBe("hidden");

    await user.keyboard("{ArrowRight}");
    expect(within(dialog).getByText(`Photo 2 of ${photos.length}`)).toBeInTheDocument();
    expect(within(dialog).getByRole("heading", { name: photos[1].caption })).toBeInTheDocument();

    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(
      within(dialog).getByText(`Photo ${photos.length} of ${photos.length}`),
    ).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(dialog).not.toHaveAttribute("open");
    expect(document.documentElement.style.overflow).toBe("");
    expect(firstThumb).toHaveFocus();
  });

  it("moves between photos with the on-screen buttons and swipes", async () => {
    const user = userEvent.setup();
    render(<MemoryGallery photos={photos} />);
    await user.click(screen.getAllByRole("button", { name: /open larger/ })[0]);
    const dialog = openViewer();

    await user.click(within(dialog).getByRole("button", { name: "Next photo" }));
    expect(within(dialog).getByText(`Photo 2 of ${photos.length}`)).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Previous photo" }));
    expect(within(dialog).getByText(`Photo 1 of ${photos.length}`)).toBeInTheDocument();

    const stage = within(dialog).getByRole("button", { name: "Next photo" }).parentElement!;
    fireEvent.pointerDown(stage, { clientX: 300, clientY: 200 });
    fireEvent.pointerUp(stage, { clientX: 120, clientY: 210 });
    expect(within(dialog).getByText(`Photo 2 of ${photos.length}`)).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Close photo viewer" }));
    expect(dialog).not.toHaveAttribute("open");
  });

  it("renders real photos with their alt text", () => {
    const real: GalleryPhoto[] = [
      { src: "/images/gallery/01.jpg", alt: "Us at the beach", orientation: "landscape" },
    ];
    render(<MemoryGallery photos={real} />);
    expect(screen.getByRole("img", { name: "Us at the beach" })).toHaveAttribute("src");
  });
});

describe("SmartImage", () => {
  // jsdom has no layout, so next/image warns that every image is 0px tall.
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("replaces a missing photo with a gentle message instead of a broken image", () => {
    render(
      <div style={{ position: "relative" }}>
        <SmartImage src="/images/gallery/missing.jpg" alt="A missing photo" sizes="100vw" />
      </div>,
    );
    const img = screen.getByRole("img", { name: "A missing photo" });
    fireEvent.error(img);
    const fallback = screen.getByRole("img", { name: "A missing photo" });
    expect(fallback.tagName).toBe("SPAN");
    expect(screen.getByText("This photo couldn’t be loaded")).toBeInTheDocument();
  });

  it("fades the photo in once it has loaded", async () => {
    render(
      <div style={{ position: "relative" }}>
        <SmartImage src="/images/gallery/01.jpg" alt="Loaded photo" sizes="100vw" />
      </div>,
    );
    const img = screen.getByRole("img", { name: "Loaded photo" });
    expect(img).toHaveClass("opacity-0");
    fireEvent.load(img);
    // next/image reports the load after decoding, asynchronously.
    await waitFor(() => expect(img).toHaveClass("opacity-100"));
  });
});

describe("StorySection", () => {
  it("renders moments with and without optional dates and photos", () => {
    const content: BirthdayContent = {
      ...birthday,
      story: {
        ...birthday.story,
        moments: [
          {
            title: "A moment with everything",
            when: "June 2019",
            description: "Full entry.",
            icon: "sun",
            photo: { src: "/images/story/a.jpg", alt: "Us in June" },
          },
          { title: "A moment with only words", description: "No date, no photo." },
        ],
      },
    };
    render(<StorySection content={content} chapter={4} />);

    expect(
      screen.getByRole("heading", { level: 2, name: birthday.story.heading }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("June 2019")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Us in June" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "A moment with only words" })).toBeInTheDocument();
  });
});
