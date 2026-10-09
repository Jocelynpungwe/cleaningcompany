/**
 * Worst-frame legibility audit for the hero copy.
 *
 * Method (from the 10k-websites standard): hide the glyphs, screenshot the real
 * composited page (frames + per-band scrim + everything the visitor sees), and
 * measure the WORST pixel under each text box. Hiding the glyphs is conservative
 * because it also removes their text-shadow.
 *
 * Text is dark on a light room, so the worst pixel is the DARKEST one.
 * Floors: 4.5:1 for body copy, 3:1 for the large headline.
 *
 *   node scripts/qa/hero-contrast.mjs [width=1440] [height=900] [mobile=0]
 */
import sharp from 'sharp'
import { launch } from './cdp.mjs'

const [w = '1440', h = '900', mobile = '0'] = process.argv.slice(2)
const W = +w
const H = +h
const isMobile = mobile === '1'

const lum = ([r, g, b]) => {
  const f = (v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
const contrast = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
const FOREST = lum([0x12, 0x3d, 0x32])
const CHARCOAL = lum([0x20, 0x2b, 0x26])

// progress points sitting inside each band's fully-visible plateau
const BANDS = [
  { name: 'Act 1 headline', sel: '.hero-band-1 .hero-h .word', at: [0.0, 0.08, 0.17], text: FOREST, min: 3 },
  { name: 'Act 1 body', sel: '.hero-band-1 .hero-body', at: [0.0, 0.08, 0.17], text: CHARCOAL, min: 4.5 },
  { name: 'Act 2 headline', sel: '.hero-band-2 .hero-h .word', at: [0.45, 0.52, 0.6], text: FOREST, min: 3 },
  { name: 'Act 3 headline', sel: '.hero-band-3 .hero-h .word', at: [0.9, 0.95, 1.0], text: FOREST, min: 3 },
  { name: 'Act 3 body', sel: '.hero-band-3 .hero-body', at: [0.9, 0.95, 1.0], text: CHARCOAL, min: 4.5 },
]

const b = await launch({ port: 9355 })
let failed = 0
try {
  await b.viewport(W, H, { mobile: isMobile, touch: isMobile, dpr: 1 })
  await b.goto('http://localhost:5173/')
  for (let i = 0; i < 60; i++) {
    if ((await b.eval(`document.querySelector('.hero-stage')?.dataset.ready`)) === 'true') break
    await b.sleep(250)
  }
  // wait until every frame is loaded so the audit sees the real image at each point
  await b.sleep(6000)
  const range = await b.eval(`(() => { const sp = document.querySelector('.pin-spacer'); return sp.offsetHeight - innerHeight })()`)

  console.log(`viewport ${W}x${H}${isMobile ? ' (mobile)' : ''}, pin range ${range}px\n`)
  console.log('band'.padEnd(18), 'progress', 'worst-px contrast', 'p1 contrast', 'floor', 'result')

  for (const band of BANDS) {
    for (const p of band.at) {
      await b.scrollTo(Math.round(range * p))
      await b.sleep(1500)
      // hide glyphs, measure box
      const rect = await b.eval(`(() => {
        const els = [...document.querySelectorAll(${JSON.stringify(band.sel)})]
        els.forEach((e) => (e.style.visibility = 'hidden'))
        let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9
        els.forEach((e) => { const r = e.getBoundingClientRect(); if (r.width) { x0 = Math.min(x0, r.left); y0 = Math.min(y0, r.top); x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom) } })
        // captureScreenshot's clip is in DOCUMENT coordinates: add the scroll offset.
        return JSON.stringify({ x: Math.max(0, x0) + scrollX, y: Math.max(0, y0) + scrollY, width: Math.min(innerWidth, x1) - Math.max(0, x0), height: Math.min(innerHeight, y1) - Math.max(0, y0) })
      })()`)
      const clip = JSON.parse(rect)
      const png = await b.shotBuffer({ clip })
      await b.eval(`document.querySelectorAll(${JSON.stringify(band.sel)}).forEach((e) => (e.style.visibility = ''))`)

      const { data, info } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true })
      const lums = []
      for (let i = 0; i < data.length; i += info.channels) lums.push(lum([data[i], data[i + 1], data[i + 2]]))
      lums.sort((a, c) => a - c)
      const worst = lums[0]
      const p1 = lums[Math.floor(lums.length * 0.01)]
      const cw = contrast(band.text, worst)
      const c1 = contrast(band.text, p1)
      const ok = cw >= band.min
      if (!ok) failed++
      console.log(
        band.name.padEnd(18),
        String(p).padEnd(8),
        cw.toFixed(2).padEnd(17),
        c1.toFixed(2).padEnd(11),
        String(band.min).padEnd(5),
        ok ? 'PASS' : 'FAIL',
      )
    }
  }
  console.log(failed ? `\n${failed} measurement(s) below the floor` : '\nAll measurements at or above the floor')
} finally {
  await b.close()
}
process.exit(failed ? 1 : 0)
