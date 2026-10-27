# Your photos go here

```
public/images/
├── gallery/   ← photos for "Little moments, kept forever"
└── story/     ← optional photos for the "Our story" timeline
```

## Adding a photo (3 steps)

1. **Prepare it.** Export as JPG or WebP, about **2000 px on the longest side**
   (phone photos are usually far bigger than needed). Use simple file names
   without spaces: `01-first-date.jpg`, `02-beach.jpg`.
2. **Copy it** into `gallery/` or `story/`.
3. **Point to it** in `src/content/birthday.ts`:

   ```ts
   // gallery
   {
     src: "/images/gallery/01-first-date.jpg", // note: no "public" in the path
     alt: "Us laughing at a café table on our first date",
     caption: "Our first date",
     orientation: "portrait", // "portrait" (tall), "landscape" (wide) or "square"
     focus: "50% 30%", // optional — which part to keep when cropping
   },

   // story moment
   photo: { src: "/images/story/first-day.jpg", alt: "Describe the photo" },
   ```

The site resizes and compresses photos automatically for each screen, and
only downloads them as they scroll into view.

## Good to know

- **Alt text** describes the photo for anyone who can't see it. One plain
  sentence is perfect.
- **Orientation** picks the frame shape. Photos are cropped to fit; nudge the
  crop with `focus` (`"50% 0%"` keeps the top, `"50% 100%"` the bottom).
- **Remove location data.** Photos from phones often contain GPS coordinates.
  Files in `public/` are published exactly as they are, so re-export them
  (most photo apps have a "remove location" option) before adding them.
- **Everything in `public/` is public.** Anyone with the site's link can see
  these files. Only add photos you're happy for guests to see.
- If a path is wrong, the site shows a gentle "couldn't be loaded" card
  instead of a broken image — check the spelling and the folder.
