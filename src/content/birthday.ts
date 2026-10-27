import type { BirthdayContent } from "./types";

/* ──────────────────────────────────────────────────────────────────────────
 * ✏️  PERSONALISE THE WHOLE WEBSITE FROM THIS ONE FILE
 *
 * 1. Fill in the three names just below — they flow into every section.
 * 2. Work down the file and replace the sample words with your own.
 *    Everything marked ✏️ is sample text: warm, but not about *you two*
 *    yet. Nothing here claims real memories — that part is yours to write.
 * 3. Add photos to /public/images (see public/images/README.md) and point
 *    the `src` fields at them.
 *
 * Save the file while `npm run dev` is running and the page updates
 * instantly. Optional fields (marked "optional") can be deleted safely.
 * ────────────────────────────────────────────────────────────────────────── */

const HER_NAME = "Her Name"; // ✏️ Her name, as it should appear in the big headline
const HER_NICKNAME = "Sweetheart"; // ✏️ What you call her ("My dearest Sweetheart,")
const YOUR_NAME = "Your Name"; // ✏️ Your name, for signing the letter and notes

export const birthday: BirthdayContent = {
  people: {
    her: { name: HER_NAME, nickname: HER_NICKNAME },
    you: { name: YOUR_NAME },
  },

  /* Her birthday. The countdown reaches zero at midnight in this time zone. */
  date: {
    year: 2026,
    month: 11, // November
    day: 9,
    timeZone: "Asia/Dhaka",
  },

  site: {
    // Shown in browser tabs and link previews — keep personal details out.
    title: "A Little Universe, Just for You",
    description: "A little birthday surprise, made with love.",
    // ✏️ Optional: your public URL once deployed, e.g. "https://our-universe.vercel.app".
    // On Vercel this is detected automatically, so you can usually leave it out.
    url: undefined,
    // Search engines are asked not to list the site. (Not a privacy control!)
    allowSearchIndexing: false,
    language: "en",
  },

  hero: {
    eyebrow: "A little universe, just for you",
    greeting: "Happy birthday,",
    subtitle: "Made with all my love, for my favorite person in the world.",
    primaryCta: "Open your little surprise",
    secondaryCta: "Our little story",
    scrollHint: "There's more to discover",
  },

  countdown: {
    navLabel: "Your day",
    upcoming: {
      title: "Counting down to your day",
      message: "Counting down to the day the world got a little more beautiful.",
    },
    birthday: {
      title: "Today is all about you",
      message:
        "Happy birthday! Today the whole little universe is celebrating you — every star, every petal, and especially me.",
    },
    after: {
      title: "Still celebrating you",
      message:
        "The candles are out, but the celebrating never really stops. Every day with you feels a little like a birthday.",
    },
  },

  letter: {
    navLabel: "A letter",
    eyebrow: "Sealed with love",
    heading: "A letter, just for you",
    intro: "Some things are better said slowly. Break the seal whenever you're ready.",
    envelopeNote: `For ${HER_NICKNAME}`,
    openLabel: "Open the letter",
    greeting: `My dearest ${HER_NICKNAME},`,
    // ✏️ Sample letter — rewrite it in your own words. One string per paragraph.
    paragraphs: [
      "Happy birthday, my love. I wanted to give you something you could come back to — a little corner of the internet that exists only because you do.",
      "I could write about your smile, or the way your laugh fills a room, or how you turn the most ordinary days into ones worth remembering. But the truth is simpler than all of that: life is softer, brighter and so much happier with you in it.",
      "Thank you for your patience, your kindness and the quiet way you make wherever we are feel like home. I notice it every day, even on the days I forget to say so.",
      "On your birthday, I hope you feel even a fraction of the love you give so freely. You deserve every good thing this year can hold — and I'll be right beside you for all of it.",
    ],
    closing: "Forever and always yours,",
    signature: YOUR_NAME,
    postscript: "P.S. Keep exploring — there are a few more surprises tucked away below.", // optional
  },

  adore: {
    navLabel: "Things I adore",
    eyebrow: "A very incomplete list",
    heading: "Things I adore about you",
    intro: "A few of the many, many reasons. Tap a card to read why.",
    // ✏️ 8–12 reasons works best. Icons: see `IconName` in ./types.ts.
    reasons: [
      {
        title: "Your smile",
        message:
          "It's the first thing I hope to see in the morning and the last thing I want to see at night. It makes everything feel possible.",
        icon: "smile",
      },
      {
        title: "Your laugh",
        message:
          "The real one — the one you can't hold back. It's my favorite sound in the whole world.",
        icon: "laugh",
      },
      {
        title: "Your kindness",
        message:
          "You notice people. You remember the little things. You make everyone around you feel seen.",
        icon: "hand-heart",
      },
      {
        title: "How you make ordinary days special",
        message:
          "Errands, long drives, quiet evenings at home — with you, even the everyday feels like a small adventure.",
        icon: "sun",
      },
      {
        title: "The comfort of being with you",
        message:
          "Being next to you is the calmest place I know. You are my safe place and my favorite place.",
        icon: "home",
      },
      {
        title: "Your quiet strength",
        message:
          "You carry so much, with so much grace — and you still find room to care for everyone else.",
        icon: "mountain",
      },
      {
        title: "Your beautiful heart",
        message:
          "Generous, honest and brave. It's the most beautiful thing about you, and that's saying a lot.",
        icon: "heart",
      },
      {
        title: "All the little things",
        message:
          "The habits and quirks that make you so completely, wonderfully you. I wouldn't change a single one.",
        icon: "sparkles",
      },
      {
        title: "The way you dream",
        message:
          "I love how big you dream — and I can't wait to cheer you on as every single dream comes true.",
        icon: "star",
      },
      {
        title: "Simply, you",
        message:
          "If I listed every reason, this website would never end. So here's the short version: you. Just you.",
        icon: "gem",
      },
    ],
  },

  story: {
    navLabel: "Our story",
    eyebrow: "Chapters so far",
    heading: "Our story, so far",
    intro: "A few of the chapters that brought us here. The best ones are still being written.",
    // ✏️ Replace these with your real moments. `when` can be a date ("June 2019")
    // or a gentle marker. Add a photo with:
    //   photo: { src: "/images/story/first-day.jpg", alt: "Us at the park on our first day out" },
    moments: [
      {
        when: "Once upon a time",
        title: "How our story began",
        description:
          "Somewhere, somehow, our paths crossed — and quietly, before either of us knew it, everything began to change.",
        icon: "sparkles",
      },
      {
        when: "A little later",
        title: "A moment that made me smile",
        description:
          "There was a moment — maybe small, maybe silly — when I realised I never wanted to stop making you smile.",
        icon: "smile",
      },
      {
        when: "One perfect day",
        title: "A favorite day together",
        description:
          "Some days feel as if they were made just for the two of us. I'd live this one again in a heartbeat.",
        icon: "sun",
      },
      {
        when: "Always",
        title: "A memory I never want to forget",
        description:
          "The kind of moment that plays back in my mind whenever I need a reason to smile.",
        icon: "camera",
      },
      {
        when: "Every day since",
        title: "How lucky I am",
        description:
          "In big moments and small ones, you keep reminding me how lucky I am to call you mine.",
        icon: "heart",
      },
      {
        when: "Next",
        title: "Everything still to come",
        description:
          "New places, old traditions, slow mornings and loud adventures — I can't wait to share every one of them with you.",
        icon: "infinity",
      },
    ],
  },

  gallery: {
    navLabel: "Memories",
    eyebrow: "Our little scrapbook",
    heading: "Little moments, kept forever",
    intro: "A few of my favorite snapshots of us. Tap any photo to see it up close.",
    // ✏️ Add `src: "/images/gallery/01.jpg"` to each entry once your photos are in
    // /public/images/gallery. Until then, illustrated placeholders are shown.
    // orientation: "portrait" (tall), "landscape" (wide) or "square".
    photos: [
      {
        alt: "Placeholder for our first photo together",
        caption: "Our first photo together",
        orientation: "portrait",
      },
      {
        alt: "Placeholder for a photo from a favorite trip",
        caption: "A favorite trip",
        orientation: "landscape",
      },
      {
        alt: "Placeholder for a photo of a slow weekend morning",
        caption: "Slow weekend mornings",
        orientation: "square",
      },
      {
        alt: "Placeholder for a photo of her laughing",
        caption: "That laugh",
        orientation: "portrait",
      },
      {
        alt: "Placeholder for a golden-hour photo",
        caption: "Golden hour",
        orientation: "landscape",
      },
      {
        alt: "Placeholder for a photo from a celebration together",
        caption: "Celebrating together",
        orientation: "square",
      },
      {
        alt: "Placeholder for a photo of a day to remember",
        caption: "A day I'll never forget",
        orientation: "portrait",
      },
      {
        alt: "Placeholder for a photo of the two of us",
        caption: "Us, exactly as we are",
        orientation: "landscape",
      },
    ],
  },

  notes: {
    navLabel: "Open when…",
    eyebrow: "Little envelopes",
    heading: "Open when…",
    intro: "Notes for whenever you need them — today, tomorrow, or some ordinary Tuesday.",
    // ✏️ 5–7 notes works best.
    notes: [
      {
        label: "Open when you need a smile",
        message:
          "Hi, beautiful. Just so you know: somewhere, right now, I'm probably thinking about you and smiling like a fool. There — I bet you're smiling too.",
      },
      {
        label: "Open when your day feels difficult",
        message:
          "Breathe. You've made it through every hard day so far, and you'll make it through this one too. When it's over, I'll be here with a hug and all the time you need.",
      },
      {
        label: "Open when you miss me",
        message:
          "Close your eyes for a second. I'm never really far — you carry me with you, the same way I carry you, everywhere I go.",
      },
      {
        label: "Open when you need a reminder",
        message:
          "You are loved. You are enough. You are doing so much better than you think. Read that again, slowly.",
      },
      {
        label: "Open just because",
        message: "No reason. No occasion. Just this: I love you. That's the whole note.",
      },
      {
        label: "Open on your birthday",
        message:
          "Happy birthday, my love. May this year bring you as much joy as you bring me every single day — and maybe a little extra cake.",
      },
    ],
    signOff: `— ${YOUR_NAME}`,
  },

  choose: {
    navLabel: "Pick a surprise",
    eyebrow: "Choose your adventure",
    heading: "Pick a little surprise",
    intro: "What kind of surprise would you like first? (You're allowed to open them all.)",
    backLabel: "Choose another surprise",
    allDoneMessage: "You've opened every surprise. The best one is still the life we get to share.",
    choices: [
      {
        id: "sweet",
        label: "Something sweet",
        teaser: "Soft, warm and a little bit sugary",
        icon: "candy",
        title: "A little something sweet",
        message:
          "If I could, I'd wrap up the warmest hug, your favorite dessert and a whole lazy day with nothing to do — and hand it to you right now. Consider this an IOU.",
        bonus: {
          prompt: "Read the fine print",
          reveal: "Valid forever. No expiry date. Redeemable as many times as you like.",
        },
      },
      {
        id: "funny",
        label: "Something funny",
        teaser: "Guaranteed giggle (or your money back)",
        icon: "laugh",
        title: "A little something funny",
        message: "Why did the birthday cake go to the doctor?",
        bonus: {
          prompt: "Tell me the punchline",
          reveal: "Because it was feeling a little crumby. (I'll be here all year.)",
        },
      },
      {
        id: "sentimental",
        label: "Something sentimental",
        teaser: "For your heart, from mine",
        icon: "feather",
        title: "A little something sentimental",
        message:
          "Of all the places I could be and all the people I could be with, there is nowhere I'd rather be than right beside you — today, tomorrow and every birthday after this one.",
      },
    ],
  },

  cake: {
    navLabel: "Make a wish",
    eyebrow: "The best part",
    heading: "Make a wish",
    intro:
      "Close your eyes, make a wish, then blow out the candles. No microphone needed — just tap.",
    candles: 5,
    blowLabel: "Blow out the candles",
    hint: "Tap the button, or tap each candle one by one.",
    celebrationTitle: "Your wish is on its way",
    celebrationMessage:
      "Whatever you wished for, I hope it finds you soon. And if it needs a little help getting there, you know where to find me.",
    relightLabel: "Light the candles again",
  },

  finale: {
    navLabel: "One last thing",
    eyebrow: "Before you go",
    heading: "There's one more thing",
    intro: "They say you should save the best for last. So I did.",
    buttonLabel: "One last little thing",
    title: `Happy birthday, ${HER_NAME}.`,
    // ✏️ Your final dedication. One string per paragraph.
    dedication: [
      "This little universe was made for you — every word, every star and every tiny detail.",
      "Because you deserve to feel, at least once a year, the way you make me feel every day: celebrated, cherished and endlessly loved.",
    ],
    // ✏️ Optional: a promise in your own words.
    promise:
      "I promise to keep choosing you — in every season, in every chapter, for every birthday still to come.",
    closing: "Here's to you, today and always.",
    signature: `All my love, ${YOUR_NAME}`,
    returnLabel: "Back to the beginning",
  },

  footer: {
    message: "Made with love, just for you. Always.",
    note: `For ${HER_NICKNAME}, on her birthday`, // optional
  },

  // Optional background music — off unless you add it. Only use a song you
  // have permission to use. Put the file in /public/audio and uncomment:
  // music: { src: "/audio/our-song.mp3", title: "Our song", artist: "Artist name" },
  music: undefined,

  presentation: {
    shareHeading: "Take this little universe with you",
    shareMessage: "Point your phone camera at the code to open this site.",
  },
};
