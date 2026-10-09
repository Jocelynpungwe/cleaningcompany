/**
 * Screenshots every top-level <section>/<header>/<footer> of a route, scrolling so that reveal
 * animations fire first. Sections taller than the viewport are captured in several shots.
 *   node scripts/qa/section-shots.mjs <outDir> [width=1440] [height=900] [mobile=0] [route=/]
 */
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { launch } from './cdp.mjs'

const [outDir, w = '1440', h = '900', mobile = '0', route = '/'] = process.argv.slice(2)
mkdirSync(outDir, { recursive: true })
const W = +w
const H = +h
const isMobile = mobile === '1'

const b = await launch()
try {
  await b.viewport(W, H, { mobile: isMobile, touch: isMobile, dpr: isMobile ? 2 : 1 })
  await b.goto(`http://localhost:5173${route}`)
  await b.sleep(2500)

  const sections = JSON.parse(
    await b.eval(`JSON.stringify([...document.querySelectorAll('main > section, main > header, footer, main > div > section')]
      .filter((el) => !el.closest('.pin-spacer'))
      .map((el, i) => ({ i, id: el.id || el.getAttribute('aria-labelledby') || el.tagName.toLowerCase() })))`),
  )
  console.log('sections:', sections.map((s) => s.id).join(', '))

  let n = 0
  for (const s of sections) {
    const rect = JSON.parse(
      await b.eval(`(() => {
        const el = [...document.querySelectorAll('main > section, main > header, footer, main > div > section')].filter((e) => !e.closest('.pin-spacer'))[${s.i}]
        const r = el.getBoundingClientRect()
        return JSON.stringify({ top: r.top + scrollY, height: r.height })
      })()`),
    )
    const shots = Math.max(1, Math.ceil(rect.height / (H * 0.92)))
    for (let k = 0; k < shots; k++) {
      await b.scrollTo(Math.max(0, rect.top + k * H * 0.92 - (k === 0 ? 0 : 0)))
      await b.sleep(1100)
      const file = path.join(outDir, `${String(++n).padStart(2, '0')}-${s.id.replace(/[^a-z0-9-]/gi, '_')}${shots > 1 ? `-${k + 1}` : ''}.png`)
      await b.shot(file)
    }
  }
  console.log('console issues:', JSON.stringify(b.logs.filter((l) => ['error', 'exception', 'warning', 'warn'].includes(l.type)), null, 1))
} finally {
  await b.close()
}
