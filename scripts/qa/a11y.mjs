/**
 * Automated accessibility audit with axe-core, injected into a real headless Chrome.
 *   node scripts/qa/a11y.mjs [baseUrl=http://localhost:5173] [width=1440] [height=900] [mobile=0]
 *
 * Audits every route, plus the hero at several scroll positions (start, mid-clean, final).
 * Text laid over the hero canvas is reported by axe as "incomplete" for colour contrast
 * (it cannot sample a canvas): that is covered by scripts/qa/hero-contrast.mjs instead.
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { launch } from './cdp.mjs'

const [base = 'http://localhost:5173', w = '1440', h = '900', mobile = '0'] = process.argv.slice(2)
const require = createRequire(import.meta.url)
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8')

const b = await launch({ port: 9377 })
let total = 0
try {
  await b.viewport(+w, +h, { mobile: mobile === '1', touch: mobile === '1', dpr: mobile === '1' ? 2 : 1 })

  // Scroll the whole page once so every scroll-reveal has finished (axe would otherwise read
  // half-transparent, not-yet-revealed text), then return to where the caller had put us.
  async function revealAll() {
    const y0 = await b.eval('window.scrollY')
    const H = await b.eval('document.documentElement.scrollHeight')
    for (let y = 0; y < H; y += 500) {
      await b.scrollTo(y)
      await b.sleep(60)
    }
    await b.sleep(1200)
    await b.scrollTo(y0)
    await b.sleep(1500) // let the hero scrub settle back
  }

  async function audit(label) {
    await revealAll()
    await b.eval(axeSource)
    const res = JSON.parse(
      await b.eval(`axe.run(document, { resultTypes: ['violations', 'incomplete'] }).then((r) => JSON.stringify({
        v: r.violations.map((x) => ({ id: x.id, impact: x.impact, help: x.help, nodes: x.nodes.slice(0, 4).map((n) => n.target.join(' ') + ' :: ' + (n.failureSummary || '').split('\\n').slice(1, 3).join(' ')) })),
        inc: r.incomplete.map((x) => ({ id: x.id, n: x.nodes.length })),
      }))`),
    )
    total += res.v.length
    console.log(`${res.v.length ? 'FAIL' : 'PASS'}  ${label}  violations: ${res.v.length}${res.inc.length ? '   needs manual check: ' + res.inc.map((i) => `${i.id}(${i.n})`).join(', ') : ''}`)
    for (const v of res.v) {
      console.log(`      [${v.impact}] ${v.id}: ${v.help}`)
      v.nodes.forEach((n) => console.log('         ', n))
    }
  }

  // hero at three moments
  await b.goto(base + '/')
  await b.sleep(3500)
  const R = await b.eval(`document.querySelector('.pin-spacer') ? document.querySelector('.pin-spacer').offsetHeight - innerHeight : 0`)
  for (const [p, name] of [[0, 'home, hero start'], [0.5, 'home, hero mid-clean'], [1, 'home, hero final']]) {
    await b.scrollTo(Math.round(R * p))
    await b.sleep(1600)
    await audit(name)
  }
  await b.scrollTo(R + 1200)
  await b.sleep(800)
  await audit('home, below the hero')

  for (const route of ['/about', '/services', '/gallery', '/contact', '/privacy', '/does-not-exist']) {
    await b.goto(base + route)
    await b.sleep(1200)
    await audit(`route ${route}`)
  }
  // reduced motion static hero
  await b.media([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await b.goto(base + '/')
  await b.sleep(1500)
  await audit('home, reduced-motion static hero')
  await b.media([])

  // mobile drawer open
  if (+w < 1024) {
    await b.goto(base + '/')
    await b.sleep(1500)
    await b.eval(`document.querySelector('button[aria-controls="mobile-drawer"]').click()`)
    await b.sleep(400)
    await audit('home, mobile drawer open')
  }
} finally {
  console.log(`\n${total} axe violation(s) in total`)
  await b.close()
}
process.exit(total ? 1 : 0)
