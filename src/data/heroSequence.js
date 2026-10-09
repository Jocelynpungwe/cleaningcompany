/**
 * Hero frame sequence configuration.
 *
 * Frames are picked up by filename order from src/assets/images/hero/{desktop,mobile}.
 * To use the real Higgsfield renders: drop the exported frames in those folders
 * (frame-001.webp ... frame-NNN.webp, dirty -> clean), set `isPlaceholder: false`,
 * and tune `timeMap` / `beats` so the visible cleaning milestones land at the right
 * scroll %. See docs/higgsfield-production-guide.md.
 */
const desktop = import.meta.glob('/src/assets/images/hero/desktop/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
})
const mobile = import.meta.glob('/src/assets/images/hero/mobile/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
})

const toUrls = (modules) =>
  Object.keys(modules)
    .sort()
    .map((key) => modules[key])

export const heroSequence = {
  /**
   * False: the frames come from the approved Higgsfield video (review/hero/video, built by
   * scripts/build-frames-from-video.mjs). Set true to show the "Prototype" badge again.
   */
  isPlaceholder: false,
  /** Which side of the frame the copy sits on (the photo's open wall): 'left' | 'right'. */
  textSide: 'center',
  /** Copy column sized to this photo's open wall (desktop/landscape only). */
  // centred copy: text block width, headline size (vw, capped by svh in hero.css) and body width
  copyLayout: { width: '46rem', headlineSize: '4.6vw', bodyWidth: '34rem' },
  /** Shown in the corner badge while isPlaceholder is true. */
  placeholderNote: 'Prototype frames.',

  desktop: {
    frames: toUrls(desktop),
    scrollScreens: 5.6, // total pinned scroll distance, in viewport heights
    maxPixels: 2_400_000, // canvas backing-store cap (keeps 4K screens cheap)
  },
  mobile: {
    frames: toUrls(mobile),
    scrollScreens: 4.6,
    maxPixels: 1_700_000,
  },

  /**
   * Scroll progress -> position in the frame sequence. Piecewise-linear [progress, position].
   * Holds the messy room through Act 1, spends Act 2 on the cleaning, and lands on the
   * final frame by 86% so the finished room is on screen for the last 14% of the pin.
   */
  timeMap: [
    [0, 0],
    [0.25, 0.14], // Act 1 holds the filthy stove (the video's first second is nearly still)
    [0.75, 0.62], // Act 2 is the cleaning (the video cleans between roughly 1s and 3.7s)
    [0.88, 1],
    [1, 1],
  ],

  /**
   * Where each beat of the story starts, as scroll progress (0..1). Every text beat gets a
   * long fully-visible plateau with short eased edges; validate changes with
   * `node scripts/qa/hero-behaviour.mjs` (flick test) and `hero-contrast.mjs`.
   */
  beats: {
    cueOut: 0.02, // "Scroll to clean" fades as soon as the visitor gets it
    act1: { bodyOut: 0.19, wordsOut: 0.2, bandOut: 0.25 }, // "Life Gets Messy."
    act2: { in: 0.27, out: 0.62, bandOut: 0.67 }, // "We Make It Beautiful Again."
    rail: { in: 0.22, out: 0.72 }, // cleaning checklist
    gleam: { in: 0.46, out: 0.64 }, // one light sweep as the room brightens
    act3: { in: 0.71, body: 0.78, cta: 0.8, ctaLive: 0.83 }, // "Come Home to Clean." + CTAs
  },
}
