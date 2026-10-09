/**
 * Horizontal-overflow + clipping sweep across common viewport widths.
 *   node scripts/qa/overflow.mjs [baseUrl=http://localhost:5173]
 * For each width it loads every route, scrolls through the hero, and fails if the page can
 * scroll sideways, if any hero text box leaves the viewport, or if the console reports errors.
 */
import { launch } from './cdp.mjs'

const base = process.argv[2] || 'http://localhost:5173'
const SIZES = [
  [320, 568, true],
  [360, 740, true],
  [375, 667, true],
  [390, 844, true],
  [414, 896, true],
  [600, 960, true],
  [768, 1024, true],
  [820, 1180, true],
  [1024, 768, false],
  [1280, 720, false],
  [1440, 900, false],
  [1920, 1080, false],
  [2560, 1440, false],
]
const ROUTES = ['/', '/about', '/services', '/gallery', '/contact']

const b = await launch({ port: 9388 })
let bad = 0
try {
  for (const [w, h, mobile] of SIZES) {
    await b.viewport(w, h, { mobile, touch: mobile, dpr: mobile ? 2 : 1 })
    const issues = []
    for (const route of ROUTES) {
      await b.goto(base + route)
      await b.sleep(route === '/' ? 3200 : 900)
      const over = async (tag) => {
        const o = await b.eval(`document.documentElement.scrollWidth - innerWidth`)
        if (o > 0) issues.push(`${route} ${tag}: scrolls sideways by ${o}px`)
      }
      await over('top')
      if (route === '/') {
        const R = await b.eval(`document.querySelector('.pin-spacer') ? document.querySelector('.pin-spacer').offsetHeight - innerHeight : 0`)
        for (const p of [0.1, 0.45, 0.9, 1]) {
          await b.scrollTo(Math.round(R * p))
          await b.sleep(1300)
          await over(`hero@${p}`)
          // every visible hero text block must sit inside the viewport
          const out = await b.eval(`(() => {
            const bad = []
            document.querySelectorAll('.hero-h, .hero-body, .hero-cta a, .hero-rail, .hero-cue').forEach((el) => {
              const cs = getComputedStyle(el)
              const band = el.closest('.hero-band')
              if (band && parseFloat(getComputedStyle(band).opacity) < 0.5) return
              if (parseFloat(cs.opacity) < 0.5 || cs.display === 'none') return
              const r = el.getBoundingClientRect()
              if (r.width && (r.left < -1 || r.right > innerWidth + 1 || r.bottom > innerHeight + 1)) bad.push(el.className + ' ' + Math.round(r.left) + '-' + Math.round(r.right) + ' b' + Math.round(r.bottom))
            })
            return bad.join(' | ')
          })()`)
          if (out) issues.push(`/ hero@${p}: outside viewport: ${out}`)
        }
        await b.scrollTo(R + 1500)
        await b.sleep(500)
        await over('after hero')
      }
    }
    const errs = b.logs.filter((l) => ['error', 'exception'].includes(l.type) && !/favicon/i.test(l.text))
    if (errs.length) issues.push('console errors: ' + JSON.stringify(errs.slice(0, 3)))
    b.logs.length = 0
    bad += issues.length
    console.log(`${issues.length ? 'FAIL' : 'PASS'}  ${w}x${h}${mobile ? ' (phone/tablet, touch)' : ''}${issues.length ? '\n      ' + issues.join('\n      ') : ''}`)
  }
} finally {
  console.log(`\n${bad} issue(s)`)
  await b.close()
}
process.exit(bad ? 1 : 0)
