/**
 * Hero copy. Presentation lives in sections/Hero; the words live here so they
 * can be edited without touching animation code.
 */
export const heroCopy = {
  act1: {
    headline: 'Life Gets Messy.',
    body: "Between work, family, and everything in between, keeping your space spotless isn't always easy.",
    cue: 'Scroll to clean',
  },
  act2: {
    headline: 'We Make It Beautiful Again.',
    emphasis: ['Beautiful'],
  },
  act3: {
    headline: 'Come Home to Clean.',
    body: 'Exceptional cleaning services that give you more time to enjoy what matters.',
    primary: { label: 'Get Your Free Quote', to: '/contact' },
    secondary: { label: 'Explore Our Services', to: '/services' },
  },
  // Progress rail shown during Act 2. `at` is scroll progress (0 to 1). Matched to the stove video.
  milestones: [
    { at: 0.25, label: 'Crumbs cleared' },
    { at: 0.4, label: 'Grease lifted' },
    { at: 0.5, label: 'Stove scrubbed' },
    { at: 0.65, label: 'Tiles spotless' },
  ],
  alt: 'A spotless kitchen stove seen from above, with clean tiles and tidy open shelves beside it',
}
