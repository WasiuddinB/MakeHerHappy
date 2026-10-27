# A Little Universe, Just for You ✨

An interactive birthday website: a love letter, a scrapbook and a tiny
magical world in one page, made for one person's birthday on
**November 9, 2026**. It's built to be opened on her phone, shared through a
QR code, and shown on a big screen at the celebration.

**What's inside**

| Chapter         | What happens                                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Opening         | Her name, drifting petals and a constellation heart that bursts open when she taps **Open your little surprise**               |
| Your day        | A live countdown to midnight in Dhaka that turns into a birthday message on the day, and a "still celebrating" note afterwards |
| A letter        | An envelope with a wax seal that opens into a full letter                                                                      |
| Things I adore  | Cards that turn over to reveal why, one at a time or all at once                                                               |
| Our story       | A timeline of your moments, with optional photos                                                                               |
| Memories        | A scrapbook gallery with a full-screen viewer (swipe, arrow keys, Escape)                                                      |
| Open when…      | Little envelopes holding notes for later                                                                                       |
| Pick a surprise | Sweet, funny or sentimental: she chooses                                                                                       |
| Make a wish     | A cake whose candles she blows out (with a tap), followed by confetti                                                          |
| One last thing  | The final dedication, revealed under the stars                                                                                 |

Plus a **Birthday Presentation Mode** for the party, a share QR code, and
gentle behaviour for people who prefer reduced motion.

---

## Quick start

You need **Node.js 24** (or 22.12+) and npm.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. Every time you save a file, the page updates.

---

## ✏️ Personalisation checklist

Everything she sees comes from **one file**: [`src/content/birthday.ts`](src/content/birthday.ts).
Everything marked ✏️ in it is sample text: warm, but not about _you two_
yet. Nothing in it claims real memories; that part is yours to write.

- [ ] **Names**: the three lines at the top of the file (`HER_NAME`,
      `HER_NICKNAME`, `YOUR_NAME`). They flow into every section.
- [ ] **Date & time zone**: already November 9, 2026 in `Asia/Dhaka`.
- [ ] **The letter**: `letter.paragraphs` (one string per paragraph), plus the
      closing and the P.S.
- [ ] **Things I adore**: `adore.reasons`; 8–12 works best.
- [ ] **Our story**: `story.moments`; replace each with a real moment, and set
      `when` to a date or a phrase like "Summer 2019".
- [ ] **Photos**: add them to `public/images/gallery` and `public/images/story`,
      then set each `src` (see [Photos](#photos)).
- [ ] **Open when… notes**: `notes.notes`.
- [ ] **Surprises**: `choose.choices` (the joke's punchline is the `bonus`).
- [ ] **Cake**: number of `candles` and the celebration message.
- [ ] **Finale**: `finale.dedication` and `finale.promise`, in your own words.
- [ ] Optional: **music** (see [Music](#music-optional)).
- [ ] Look at it on your phone (`npm run dev`, then open the "Network" address
      it prints, on the same Wi-Fi).
- [ ] Run `npm run check`. It catches typos such as a photo path that starts
      with `/public/`.

### Changing the birthday date

```ts
date: { year: 2026, month: 11, day: 9, timeZone: "Asia/Dhaka" },
```

The countdown reaches zero at **midnight in that time zone**, for everyone,
wherever they are, so family abroad see the same moment. `timeZone` must be an
IANA name such as `"Asia/Dhaka"` or `"Europe/London"`. The page shows:

- **before** the day: a live countdown (days, hours, minutes, seconds)
- **on** the day (midnight to midnight, Dhaka time): `countdown.birthday`
- **after** the day: `countdown.after`; it never shows a stale "coming soon"

### Photos

Full guide: [`public/images/README.md`](public/images/README.md). In short:

1. Export each photo as JPG or WebP, about 2000 px on the longest side, with
   **location data removed**.
2. Put it in `public/images/gallery/` (or `story/`) with a simple lowercase
   name, e.g. `01-first-date.jpg`.
3. Point to it in `birthday.ts` and describe it:

```ts
{
  src: "/images/gallery/01-first-date.jpg", // no "public" in the path
  alt: "Us laughing at a café table on our first date",
  caption: "Our first date",
  orientation: "portrait", // "portrait", "landscape" or "square"
  focus: "50% 30%", // optional: which part to keep when cropping
},
```

Until a photo has a `src`, a softly illustrated placeholder labelled "Your
photo here" is shown. If a path is wrong, a gentle "couldn't be loaded" card
appears instead of a broken image. Photos are resized for each screen and
only downloaded as they scroll into view.

> **File names are case-sensitive once deployed.** `Beach.JPG` and
> `beach.jpg` are the same file on Windows but different files on Vercel. Use
> lowercase everywhere.

### The letter and messages

All text lives in `birthday.ts`: the letter, the reasons, the notes, the
surprises, the cake messages and the finale. Plain text only; write it exactly
as you'd say it. Lists can be longer or shorter than the samples, and a
section whose list is empty is left out of the page automatically.

### Music (optional)

Off by default, and it never plays by itself.

1. Put an MP3 you have permission to use in `public/audio/`, e.g.
   `public/audio/our-song.mp3`. (Commercial songs are usually copyrighted;
   the site is public.)
2. In `birthday.ts`, set
   `music: { src: "/audio/our-song.mp3", title: "Our song", artist: "…" }`.

A small ♪ button appears in the header and the presentation controls. It
starts only when someone taps it, and pauses with another tap.

---

## Presentation mode (for the party)

Made for a TV, projector or laptop: bigger type, one chapter per screen, and no
everyday navigation.

- **Start it**: the **Present** button in the header, the **Chapters** menu,
  or open the site with `?present` at the end of the address
  (e.g. `https://your-site.vercel.app/?present`). Handy as a bookmark on the
  party laptop.
- **Move between chapters**: the ‹ › buttons, the **← →** arrow keys,
  **Page Up / Page Down** (most presentation clickers send these),
  **Home / End**.
- **Full screen**: the ⛶ button (shown only where the browser supports it).
- **Share**: the QR button shows a large code guests can scan (see below).
- **Leave**: the **Exit** button or **Esc**. Everything stays interactive; she
  can still open the letter, flip cards and blow out the candles.

Tips for the day: open the site on the laptop beforehand, turn off sleep and
notifications, and do one run-through on the actual TV.

---

## Deploying to Vercel

The site is fully static, needs no database or environment variables, and
runs on Vercel's free tier.

1. Push this folder to a GitHub repository.
2. In Vercel, choose **Add New… → Project**, import the repository, and keep the
   detected **Next.js** settings. No environment variables are required.
3. Click **Deploy**. When it finishes you get a public address like
   `https://your-project.vercel.app`; that's the link to share.
4. **Production branch**: Vercel uses your default branch (normally `main`).
   Every push to it redeploys the live site; other branches get private
   preview links.

**Check it the way guests will**: open the address on your phone **using mobile
data, not Wi-Fi**, and in a private/incognito window. Vercel's default
"Deployment Protection" covers preview links but not your production address.
If the production page asks for a login, check _Project → Settings →
Deployment Protection_.

**Updating the site later**: edit `src/content/birthday.ts` or add photos,
run `npm run check`, then commit and push. Vercel rebuilds and replaces the
live site in a minute or two, at the same address.

**Node version**: `package.json` pins `"engines": { "node": "24.x" }`, which
Vercel follows automatically.

**Optional environment variable**: `NEXT_PUBLIC_SITE_URL` (see
[`.env.example`](.env.example)) sets the public address used for link previews
and the QR code. On Vercel it's detected automatically, so set it only if you
add a custom domain or host somewhere else.

Official docs:
[Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs) ·
[Deploying with Git](https://vercel.com/docs/git) ·
[Environment variables](https://vercel.com/docs/environment-variables) ·
[Deployment protection](https://vercel.com/docs/deployment-protection) ·
[Next.js deployment guide](https://nextjs.org/docs/app/getting-started/deploying)

### Share QR code

- **In presentation mode**: once the site is deployed on Vercel, a QR button
  appears in the presentation controls automatically. It only ever points at
  the real public address; locally there is no public address, so the button
  stays hidden.
- **To print one** (table cards, a frame at the entrance):

  ```bash
  npm run qr -- https://your-project.vercel.app
  ```

  This saves `share-qr.svg` (sharp at any size) and `share-qr.png` in the
  project folder. It refuses `localhost` and non-https addresses.

- **Verify it**: scan the printed code with a phone on mobile data and make
  sure the live site opens.

---

## Development

| Command               | What it does                                                  |
| --------------------- | ------------------------------------------------------------- |
| `npm run dev`         | Local development server at <http://localhost:3000>           |
| `npm run build`       | Production build (also type-checks)                           |
| `npm run start`       | Serve the production build                                    |
| `npm run lint`        | ESLint (Next.js core-web-vitals and React Hooks rules)        |
| `npm run typecheck`   | Generate route types, then strict TypeScript check            |
| `npm test`            | Unit and component tests (Vitest and Testing Library)         |
| `npm run test:e2e`    | Browser tests (Playwright); builds and serves the site itself |
| `npm run format`      | Format with Prettier                                          |
| `npm run check`       | Lint, typecheck, unit tests and build in one go               |
| `npm run qr -- <url>` | Printable QR code for the deployed URL                        |

First time running browser tests: `npx playwright install chromium`.

### Tech

- **Next.js 16** (App Router, Turbopack) and **React 19**, in **TypeScript** (strict)
- **Tailwind CSS 4** with a custom design-token palette and a few deliberate CSS rules
- **next/font** (Fraunces, DM Sans, Caveat), self-hosted at build time, so
  visitors' browsers never contact Google
- **lucide-react** icons; **qrcode** (build time only)
- Animation is **CSS-only**: transforms and opacity, with every effect turned off
  for reduced-motion users. A motion library was trialled and removed after
  measuring that it added about 20 KB to the critical path for two transitions.
- **Vitest**, **Testing Library**, **Playwright** and **axe-core** for testing

### Project structure

```text
src/
  app/                     layout (fonts, metadata), page, 404, icons,
                           Open Graph image, robots.txt, sitemap
  content/
    birthday.ts            ← everything she reads: edit this
    types.ts               the shape of that content
  components/
    birthday/              one folder-level component per chapter
                           (server "Section" shells plus small client islands)
    layout/                header, chapter menu, dot rail, presentation mode,
                           footer, shared client state (Experience.tsx)
    ui/                    Button, Modal (native <dialog>), Reveal,
                           SmartImage, SectionHeading, Icon
    decor/                 petals, stars, constellation, photo placeholders
  lib/                     date maths, site URL rules, QR, confetti, hooks
  assets/fonts/            WOFF fonts for the link-preview image (OFL)
public/images/             your photos (see public/images/README.md)
public/audio/              optional music
tests/unit/                Vitest: logic, components, content checks
tests/e2e/                 Playwright: journeys, layout, accessibility, clock
scripts/make-qr.mjs        printable QR code
```

### How it works (for engineers)

- **Fully static.** `/` and every metadata route are prerendered at build time;
  `ensureStatic = "navigation"` in the root layout makes the build fail if
  anything ever makes the page dynamic. No server code runs per visit.
- **Content is data.** Sections are server components that read
  `birthday.ts`. Only interactive pieces (letter, cards, gallery, notes,
  picker, cake, finale, navigation) ship JavaScript.
- **Countdown without hydration mismatches.** The birthday is converted to an
  absolute instant on the server, DST-safe for any IANA zone. The client reads
  the time through a `useSyncExternalStore` clock whose server snapshot is
  `null`, so the static HTML shows a neutral, date-free state and can't
  pre-bake a stale countdown. One shared timer, aligned to the second.
- **Accessibility.** Native `<dialog>` modals (focus containment, Escape,
  focus return, scroll lock), visible focus styles, a skip link, focus moved to
  new content after every reveal, `inert` on hidden card faces, live regions
  for changing text, and 24 px+ touch targets. Contrast was checked for every
  token pair.
- **Reduced motion.** Petals and stars stay still, reveals and the letter open
  instantly, confetti is skipped, and scrolling jumps instead of gliding.
- **Privacy.** No analytics, cookies, forms, logins or third-party requests.
  Nothing anyone does on the page leaves the browser.

### Verification (measured on a local production build, October 2026)

- **104** unit and component tests and **62** browser tests (mobile and
  desktop), all passing.
- Browser tests cover every user journey, the three countdown states
  (driven by Playwright's clock), reduced motion, the 404 page, metadata, and
  **no sideways scrolling** at 320, 375, 390, 430, 768, 1024, 1440 and 1920 px.
- **axe-core: 0 WCAG 2.2 AA violations**, including with dialogs open and
  everything revealed.
- **Lighthouse 13.5** (Performance / Accessibility / Best Practices / SEO):
  - Desktop: **100 / 100 / 100 / 63**
  - Mobile (simulated slow 4G and 4× CPU): **86–88 / 100 / 100 / 63**;
    LCP 3.7 s, CLS 0, TBT 70–150 ms
  - SEO is 63 **on purpose**: the page asks search engines not to list it
    (`site.allowSearchIndexing: false`). That is the only failing SEO check.
  - Mobile performance is mostly about font and framework bytes on the
    simulated connection. The fonts are already trimmed (from 374 KB to 230 KB)
    without changing the typography.

---

## Privacy: please read

- **A deployed site is public.** Anyone with the link, or anyone who finds
  it, can see everything on it, including every file in `public/`. An unlisted
  address is not a secret, and there is no password protection.
- `allowSearchIndexing: false` (the default) _asks_ search engines not to list
  the site. Well-behaved ones listen, but it is not a privacy control. Link
  previews in WhatsApp, iMessage and similar still work.
- Only include photos and words you're comfortable with guests seeing, and
  strip location data from photos first.
- The link preview image and page title are generic on purpose ("A Little
  Universe, Just for You") and contain no names.

---

## Troubleshooting

| Problem                                         | Fix                                                                                                                             |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `npm install` warns about Node                  | Use Node 24 (`node --version`). Node 22.12+ also works for building.                                                            |
| Port 3000 already in use                        | `npm run dev -- -p 3001`                                                                                                        |
| Build fails with "time zone … isn't recognised" | `date.timeZone` must be an IANA name, e.g. `"Asia/Dhaka"`.                                                                      |
| A photo shows "couldn't be loaded"              | Check the path starts with `/images/…` (not `/public/…`) and matches the file name exactly, including upper/lower case.         |
| Photos look badly cropped                       | Change `orientation`, or nudge the crop with `focus: "50% 20%"`.                                                                |
| Build warns "metadataBase property … not set"   | Normal on your computer: there's no public address yet. On Vercel it's set automatically; elsewhere set `NEXT_PUBLIC_SITE_URL`. |
| No QR button in presentation mode               | Expected locally. It appears once deployed on Vercel, or when `NEXT_PUBLIC_SITE_URL` / `site.url` is a public https address.    |
| Music button greyed out                         | The file couldn't be played. Check the path under `public/audio/` and use MP3.                                                  |
| No full-screen button                           | Some browsers (e.g. iPhone Safari) don't allow it; presentation mode works without it.                                          |
| `npm run test:e2e` says a browser is missing    | `npx playwright install chromium`                                                                                               |
| The page didn't update after deploying          | Make sure you pushed to the production branch, then hard-refresh the phone browser.                                             |

---

## Credits

Fonts: [Fraunces](https://github.com/undercasetype/Fraunces),
[DM Sans](https://github.com/googlefonts/dm-fonts) and
[Caveat](https://github.com/googlefonts/caveat), all under the SIL Open Font
License (copies in [`src/assets/fonts`](src/assets/fonts)). Icons:
[Lucide](https://lucide.dev) (ISC).

Made with love, just for her. Always.
