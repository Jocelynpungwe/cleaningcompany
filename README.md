# VitaGrace Cleaning Services: website

React 19 + Vite 8 + Tailwind CSS 4 + React Router 7 + GSAP/ScrollTrigger. JavaScript (no TypeScript).
Display font Playfair Display, text font Plus Jakarta Sans, both self-hosted (no third-party requests).

**What is built:** the scroll-controlled "messy to spotless" kitchen-stove hero, the full homepage
(13 sections), and the About, Services, Gallery, Contact and Privacy pages. Real business details from the
owner are in `src/data/business.js`.

## Setup

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build to dist/
npm run preview    # serve the production build
npm run lint
```

Node 20+ (developed on Node 24). Copy `.env.example` to `.env` and set `VITE_SITE_URL` before deploying.

## Where things live

```
src/
  data/        business.js (name, phone, email, area), services.js, homeContent.js (all homepage copy),
               pricing.js (estimator rates), testimonials.js, gallery.js, heroCopy.js, heroSequence.js
  sections/    Hero, Trust, About, Services, Gallery (before/after), Why, Process, Estimator,
               Testimonials, Areas, FAQ, CTA
  pages/       Home, About, Services, Gallery, Contact, Privacy, NotFound
  components/  ui (Button, Compare slider, CountUp, Reveal, ...), layout (Navbar, Footer), common
  lib/         quoteForm.js (Zod schema + message builder)
  animations/  gsap.js, frameSequence.js (canvas frame player for the hero)
scripts/       image pipeline + qa/ (headless-Chrome test suites)
docs/          higgsfield-production-guide.md
```

Words live in `src/data`, motion in `src/animations` and `src/sections`, tokens in `src/styles/index.css`.
Change the business name, phone, email or services in the data files; no component edits are needed.

## How the main pieces work

**Hero.** One GSAP timeline mapped to scroll progress (pinned, `scrub`), driving a canvas frame sequence made
from a Higgsfield start-frame to end-frame video (`scripts/build-frames-from-video.mjs`). Copy and buttons are
centred on every screen size. It switches live to a still image for `prefers-reduced-motion`, short landscape
phones and failed frames, and cleans up fully on unmount.

**Quote form (`/contact`).** React Hook Form + Zod, accessible error summary, loading state. With no endpoint
configured it does NOT pretend to submit: it builds the message and offers "Send on WhatsApp" (opens
`wa.me/16138534419` with the text filled in) and "Send by email", and says "it has not been sent yet". Set
`VITE_FORM_ENDPOINT` to POST the JSON to a form service instead; success is shown only on a 2xx response.

**Estimator.** Rates in `src/data/pricing.js` are DEMONSTRATION values and the result is labelled "Demonstration
estimate" while `isDemo` is true. Enter the real rates, set `isDemo: false`, and review the wording.

**Testimonials.** `src/data/testimonials.js` is empty on purpose. Until real reviews are added the section shows
an invitation to share one by WhatsApp. Add entries and it switches to the review grid automatically.

**Gallery.** The before/after pairs are generated demonstration images and are labelled as such on screen.
Replace them with real photos (same spot, same position) and set `isDemo: false` in `src/data/gallery.js`.

**Images.** Section photos come from Unsplash (free licence, no attribution required) and Higgsfield. They are
rebuilt to WebP by `scripts/build-section-images.mjs`; `scripts/fetch-unsplash.mjs` downloads and previews
Unsplash photos.

## Testing

The scripts drive your installed Chrome over the DevTools protocol (no extra installs). Start `npm run dev` first.

```bash
node scripts/qa/hero-behaviour.mjs    http://localhost:5173 1440 900 0   # hero, desktop (27 checks)
node scripts/qa/hero-behaviour.mjs    http://localhost:5173 390 844 1    # hero, phone with touch (29 checks)
node scripts/qa/hero-contrast.mjs     1440 900 0                         # worst-pixel text contrast on the hero
node scripts/qa/sections-behaviour.mjs http://localhost:5173 1440 900 0  # slider, FAQ, estimator, form, count-up
node scripts/qa/a11y.mjs              # axe on every route
node scripts/qa/overflow.mjs          # no sideways scroll from 320 to 2560 px
node scripts/qa/section-shots.mjs ./review/shots 1440 900 0 /            # screenshot every section
```

Last results: hero 27/27 and 29/29, sections 37/37, axe 0 violations, overflow 0, hero contrast passes on desktop
and phone. Lighthouse mobile (simulated throttling): performance 68, accessibility 100, best practices 100,
SEO 100. Performance is below the 90 target; see "Known gaps".

## Deploy

**Vercel:** import the repo; framework Vite; build `npm run build`; output `dist`. `vercel.json` already
rewrites all routes to `index.html`. Add `VITE_SITE_URL` (and `VITE_FORM_ENDPOINT` if used) under Environment
Variables.

**Render:** New Static Site; build `npm install && npm run build`; publish directory `dist`; `render.yaml`
holds the SPA rewrite. Add the same environment variables.

Both are client-rendered. Google runs the JavaScript and reads the structured data, but for the best SEO
consider prerendering the routes (for example with `vite-plugin-prerender` or by moving to a framework later).

## Still needed before launch

1. **Owner to confirm:** the email address to publish (`goldenmart43@gmail.com` is what the current site uses),
   the "satisfaction guaranteed" wording, and that "eco-friendly, non-toxic products" is accurate. The
   "100% satisfaction rate" figure from the old site is deliberately NOT used as a number.
2. **Not supplied, so not shown:** street address, opening hours, social accounts, service-area names,
   prices, licences, insurance, certifications.
3. **Real photos of VitaGrace's own work** (before/after pairs, team, vehicle) to replace the demonstration
   images; real customer reviews with permission.
4. **Real estimator rates** (or remove the estimator).
5. **A form endpoint** (`VITE_FORM_ENDPOINT`) if you want requests delivered without WhatsApp/email.
6. **A 1200x630 share image** and `og:image` / `og:url` once the domain is final; `sitemap.xml`.
7. **Privacy page review** by the owner (and a lawyer, if desired).

## Known gaps

- Lighthouse mobile performance is 68, not 90. Remaining cost is main-thread style/layout and script startup
  under 4x CPU throttling (hero canvas setup, GSAP, a 450 KB entry bundle). Next steps: code-split GSAP and
  the below-the-fold sections, prerender a static hero shell, trim the unused font subsets.
- Not yet tested on real iOS Safari or a physical Android phone (only emulated touch in Chrome).
- The bathroom and bedroom before/after pairs are not pixel-aligned (the generator moved the camera slightly),
  so the slider shows a small jump at the divider; the living room and kitchen pairs are well aligned.
