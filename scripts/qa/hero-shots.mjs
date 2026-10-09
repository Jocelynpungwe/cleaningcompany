/**
 * Screenshot the hero at fixed scroll progress points.
 *   node scripts/qa/hero-shots.mjs <outDir> [width=1440] [height=900] [mobile=0] [url=http://localhost:5173/]
 */
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { launch } from './cdp.mjs'

const [outDir, w = '1440', h = '900', mobile = '0', url = 'http://localhost:5173/'] = process.argv.slice(2)
mkdirSync(outDir, { recursive: true })
const W = +w
const H = +h
const isMobile = mobile === '1'

const b = await launch()
try {
  await b.viewport(W, H, { mobile: isMobile, touch: isMobile, dpr: isMobile ? 2 : 1 })
  await b.goto(url)
  // wait for first frame to be ready
  for (let i = 0; i < 40; i++) {
    if ((await b.eval(`document.querySelector('.hero-stage')?.dataset.ready`)) === 'true') break
    await b.sleep(250)
  }
  await b.sleep(1800) // let the intro animation finish

  const info = await b.eval(`(() => {
    const s = document.querySelector('.hero-stage')
    const st = window.ScrollTrigger
    return JSON.stringify({ variant: s?.dataset.variant, ready: s?.dataset.ready, docH: document.documentElement.scrollHeight, vis: document.visibilityState })
  })()`)
  console.log('state', info)

  const pinRange = await b.eval(`(() => { const sp = document.querySelector('.pin-spacer'); return sp ? sp.offsetHeight - innerHeight : 0 })()`)
  console.log('pin scroll range px', pinRange)

  const points = [0, 0.1, 0.22, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
  for (const p of points) {
    await b.scrollTo(Math.round(pinRange * p))
    await b.sleep(1300) // scrub smoothing + entrances settle
    const f = path.join(outDir, `p${String(Math.round(p * 100)).padStart(3, '0')}.png`)
    await b.shot(f)
  }
  console.log('console issues:', JSON.stringify(b.logs.filter((l) => ['error', 'exception', 'warning', 'warn'].includes(l.type)), null, 1))
} finally {
  await b.close()
}
