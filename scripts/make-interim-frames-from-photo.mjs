/**
 * INTERIM hero frames from a REAL photograph (lighting-only states).
 * ---------------------------------------------------------------------------
 * Takes the master photo and derives a dusty / dim / hazy -> bright sequence using
 * only global lighting, colour and a dust-haze overlay. There are NO clutter states:
 * the photo's room is already tidy, so the "messy" look is dull light + dust, not mess.
 * Real mess (cushions on the floor, cluttered table, stains) must be generated from this
 * same photo with Higgsfield image editing (docs/higgsfield-production-guide.md), then
 * `scripts/build-frames-from-states.mjs` replaces these frames.
 *
 *   node scripts/make-interim-frames-from-photo.mjs [photo] [desktop|mobile|all]
 */
import sharp from 'sharp'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const photo = process.argv[2] || path.join(ROOT, 'review/hero/master-photo-L12.jpg')
const which = process.argv[3] || 'all'
const OUT = path.join(ROOT, 'src/assets/images/hero')

const VARIANTS = {
  // crops are in ORIGINAL photo pixels (2560 x 1707)
  desktop: { crop: { left: 0, top: 0, width: 2560, height: 1440 }, px: [1920, 1080], count: 60, q: 64, smudge: { x0: 0.3, x1: 0.49, y0: 0.3, y1: 0.74 }, retouch: { left: 156, top: 318, width: 142, height: 300, srcLeft: 306 } },
  mobile: { crop: { left: 1400, top: 0, width: 960, height: 1707 }, px: [720, 1280], count: 30, q: 64, smudge: null },
}

const clamp01 = (x) => Math.min(1, Math.max(0, x))
const ss = (x) => x * x * (3 - 2 * x)
const seg = (t, a, b) => ss(clamp01((t - a) / (b - a)))
const rng = (seed) => {
  let s = seed >>> 0
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296
}

function overlay(t, [W, H], smudge) {
  const k = 1 - seg(t, 0.2, 0.8) // 1 = dusty, 0 = clean
  const r = rng(9)
  let motes = ''
  for (let i = 0; i < 70; i++) {
    motes += `<circle cx="${(r() * W).toFixed(0)}" cy="${(r() * H * 0.8).toFixed(0)}" r="${(1 + r() * 2.4).toFixed(1)}" fill="#fff" opacity="${((0.2 + r() * 0.4) * k).toFixed(2)}"/>`
  }
  const streaks = smudge
    ? (() => {
        const bx = smudge.x0 * W, by = smudge.y0 * H, bw = (smudge.x1 - smudge.x0) * W, bh = (smudge.y1 - smudge.y0) * H
        return `<g opacity="${(0.55 * (1 - seg(t, 0.35, 0.6))).toFixed(2)}" stroke="#fff" stroke-width="${(H * 0.014).toFixed(0)}" stroke-linecap="round" fill="none" filter="url(#b)">
         <path d="M ${bx + bw * 0.1} ${by + bh * 0.2} q ${bw * 0.25} ${bh * 0.1} ${bw * 0.4} ${bh * 0.02} M ${bx + bw * 0.5} ${by + bh * 0.5} q ${bw * 0.2} ${bh * 0.08} ${bw * 0.35} ${-bh * 0.02} M ${bx + bw * 0.15} ${by + bh * 0.78} q ${bw * 0.3} ${-bh * 0.08} ${bw * 0.45} ${bh * 0.03}"/>
       </g>`
      })()
    : ''
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <filter id="b"><feGaussianBlur stdDeviation="${(H * 0.004).toFixed(1)}"/></filter>
      <filter id="n" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4" result="n"/>
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 .62  0 0 0 0 .6  0 0 0 0 .55  0 0 0 2.4 -1.25"/>
      </filter>
    </defs>
    ${streaks}
    <rect width="${W}" height="${H}" fill="#8f8b7e" opacity="${(0.34 * k).toFixed(3)}"/>
    <rect width="${W}" height="${H}" filter="url(#n)" opacity="${(0.55 * k).toFixed(3)}"/>
    ${motes}
  </svg>`)
}

async function build(name) {
  const v = VARIANTS[name]
  const dir = path.join(OUT, name)
  mkdirSync(dir, { recursive: true })
  let base = await sharp(photo).extract(v.crop).resize(v.px[0], v.px[1], { fit: 'cover' }).toBuffer()
  if (v.retouch) {
    // INTERIM retouch of the free-licence photo: cover the small wall art with a feathered patch of
    // the neighbouring plain wall. The real fix is a Higgsfield edit ("remove the wall art").
    const r = v.retouch
    const w = r.width
    const h = r.height
    const strip = (left) => sharp(base).extract({ left, top: r.top, width: 10, height: h }).resize(w, h, { fit: 'fill' }).blur(3).removeAlpha().toBuffer()
    const L = await strip(r.left - 26) // wall just left of the art
    const R = await strip(r.left + w + 14) // wall just right of the art
    const grey = async (svgBody) => sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${svgBody}</svg>`)).greyscale().raw().toBuffer()
    const ramp = await grey('<defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#fff"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/>')
    const rightWithRamp = await sharp(R).joinChannel(ramp, { raw: { width: w, height: h, channels: 1 } }).png().toBuffer()
    const blended = await sharp(L).composite([{ input: rightWithRamp }]).removeAlpha().toBuffer()
    const feather = await grey('<defs><filter id="f"><feGaussianBlur stdDeviation="8"/></filter></defs><rect width="100%" height="100%" fill="#000"/><rect x="12" y="12" width="' + (w - 24) + '" height="' + (h - 24) + '" fill="#fff" filter="url(#f)"/>')
    const patch = await sharp(blended).joinChannel(feather, { raw: { width: w, height: h, channels: 1 } }).png().toBuffer()
    base = await sharp(base).composite([{ input: patch, left: r.left, top: r.top }]).toBuffer()
  }
  for (let i = 0; i < v.count; i++) {
    const t = i / (v.count - 1)
    const k = 1 - seg(t, 0.2, 0.8) // dust factor
    const warm = seg(t, 0.55, 0.95) // gentle extra warmth at the end
    const buf = await sharp(base)
      .modulate({ brightness: 1 - 0.2 * k + 0.03 * warm, saturation: 1 - 0.5 * k + 0.04 * warm })
      .linear(1 - 0.14 * k, 16 * k)
      .recomb([
        [1 - 0.06 * k, 0, 0],
        [0, 1, 0],
        [0, 0, 1 + 0.05 * k],
      ])
      .composite([{ input: overlay(t, v.px, v.smudge) }])
      .webp({ quality: v.q, effort: 5 })
      .toBuffer()
    writeFileSync(path.join(dir, `frame-${String(i + 1).padStart(3, '0')}.webp`), buf)
    if (i % 10 === 0) console.log(name, `${i + 1}/${v.count}`, `${Math.round(buf.length / 1024)}KB`)
  }
}

for (const n of which === 'all' ? ['desktop', 'mobile'] : [which]) await build(n)
writeFileSync(
  path.join(OUT, 'README.md'),
  '# INTERIM hero frames (real photo, lighting-only)\n\nDerived from the master photo by scripts/make-interim-frames-from-photo.mjs. NOT the final sequence: there are no clutter states yet.\nReplace per docs/higgsfield-production-guide.md (Higgsfield edits of this same photo) and set `isPlaceholder: false` in src/data/heroSequence.js.\n',
)
console.log('done')
