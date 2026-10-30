/**
 * Builds the homepage section photos into src/assets/images/** as WebP.
 *
 * Sources
 *   - Unsplash (free licence, no attribution required; credits are listed in src/data/imageCredits.js)
 *     fetched at full size by scripts/fetch-unsplash.mjs into review/unsplash/full
 *   - Higgsfield generations kept in review/generated (service cards the user already paid for)
 *
 *   node scripts/build-section-images.mjs
 */
import sharp from 'sharp'
import { execFileSync } from 'node:child_process'
import { mkdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const img = (...p) => path.join(ROOT, 'src/assets/images', ...p)
const unsplash = (id) => {
  const f = path.join(ROOT, 'review/unsplash/full', `${id}.jpg`)
  if (!existsSync(f)) execFileSync('node', [path.join(ROOT, 'scripts/fetch-unsplash.mjs'), 'full', id, '2400'], { stdio: 'inherit' })
  return f
}
const gen = (name) => path.join(ROOT, 'review/generated', name)

for (const d of ['services', 'about', 'cta', 'gallery']) mkdirSync(img(d), { recursive: true })

const jobs = [
  // service cards, 4:5
  // the five services the business really offers (see src/data/services.js)
  { src: gen('residential.png'), out: img('services/residential-cleaning.webp'), w: 960, h: 1200, q: 74 },
  { src: gen('deep.png'), out: img('services/deep-cleaning.webp'), w: 960, h: 1200, q: 74 },
  { src: gen('move.png'), out: img('services/move-in-move-out-cleaning.webp'), w: 960, h: 1200, q: 74 },
  { src: unsplash('photo-1625585598750-3535fe40efb3'), out: img('services/post-construction-cleaning.webp'), w: 960, h: 1200, q: 74, frac: [0.04, 0, 0.54, 1] },
  { src: gen('office.png'), out: img('services/office-commercial-cleaning.webp'), w: 960, h: 1200, q: 74 },
  { src: unsplash('D9HHY5h9qlw'), out: img('services/airbnb-cleaning.webp'), w: 960, h: 1200, q: 74, position: 'centre' },
  // before/after gallery, 3:2 (generated demonstration pairs)
  ...['living-room:living', 'kitchen:kitchen', 'bathroom:bathroom', 'bedroom:bedroom'].flatMap((pair) => {
    const [room, key] = pair.split(':')
    return ['before:dirty', 'after:clean'].map((s) => {
      const [state, prefix] = s.split(':')
      return { src: gen(`${prefix}-${key}.png`), out: img(`gallery/${room}-${state}.webp`), w: 1600, h: 1067, q: 72 }
    })
  }),
  // about, 4:5
  { src: unsplash('photo-1713110824336-f78c320dcf8e'), out: img('about/about.webp'), w: 1000, h: 1250, q: 76, position: 'centre' },
  // final CTA, 16:9
  { src: unsplash('x3mSC1WnWhc'), out: img('cta/final-cta.webp'), w: 2000, h: 1125, q: 70, position: 'centre' },
]

for (const j of jobs) {
  if (!existsSync(j.src)) {
    console.warn('missing source, skipped:', path.relative(ROOT, j.src))
    continue
  }
  let pipeline = sharp(j.src)
  if (j.frac) {
    // optional pre-crop as fractions of the source: [left, top, width, height]
    const { width, height } = await sharp(j.src).metadata()
    const [x, y, fw, fh] = j.frac
    pipeline = pipeline.extract({ left: Math.round(x * width), top: Math.round(y * height), width: Math.round(fw * width), height: Math.round(fh * height) })
  }
  const info = await pipeline
    .resize(j.w, j.h, { fit: 'cover', position: j.position ?? 'attention' })
    .webp({ quality: j.q, effort: 5 })
    .toFile(j.out)
  console.log(path.relative(ROOT, j.out).padEnd(58), `${(info.size / 1024).toFixed(0)} KB`)
}
