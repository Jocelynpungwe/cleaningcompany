/**
 * Behavioural checks for the cinematic hero, run against a real headless Chrome.
 *   node scripts/qa/hero-behaviour.mjs [baseUrl=http://localhost:5173] [width=1440] [height=900] [mobile=0]
 * Requires the dev server (uses window.__gsapDebug, which only exists in dev builds).
 * Exit code is non-zero if any check fails.
 */
import { launch } from './cdp.mjs'

const [base = 'http://localhost:5173', w = '1440', h = '900', mobile = '0'] = process.argv.slice(2)
const W = +w
const H = +h
const isMobile = mobile === '1'
const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`)
}

const b = await launch({ port: 9366 })
const problems = () => b.logs.filter((l) => ['error', 'exception'].includes(l.type) && !/favicon/i.test(l.text))

async function boot(url = base + '/') {
  await b.goto(url)
  for (let i = 0; i < 60; i++) {
    const ready = await b.eval(`document.querySelector('.hero-stage')?.dataset.ready === 'true' || !!document.querySelector('.hero-static')`)
    if (ready) break
    await b.sleep(250)
  }
  await b.sleep(1200)
  // wait until every frame has loaded, so pixel checks see the final blend pair
  for (let i = 0; i < 120; i++) {
    const done = await b.eval(`!window.__heroSeq || window.__heroSeq.loadedCount === window.__heroSeq.frameCount`)
    if (done) break
    await b.sleep(250)
  }
  await b.sleep(600)
}
const counts = () =>
  b.eval(`JSON.stringify({ spacers: document.querySelectorAll('.pin-spacer').length, triggers: window.__gsapDebug?.ScrollTrigger.getAll().length ?? -1, stages: document.querySelectorAll('.hero-stage').length, statics: document.querySelectorAll('.hero-static').length, canvases: document.querySelectorAll('canvas').length })`).then(JSON.parse)
const range = () => b.eval(`(() => { const sp = document.querySelector('.pin-spacer'); return sp ? sp.offsetHeight - innerHeight : 0 })()`)
const tiny = () =>
  b.eval(`(() => { const c = document.querySelector('.hero-canvas'); const t = document.createElement('canvas'); t.width = 64; t.height = 36; const x = t.getContext('2d'); x.drawImage(c, 0, 0, 64, 36); return Array.from(x.getImageData(0, 0, 64, 36).data) })()`)

try {
  await b.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `window.__perf = { lcp: 0, lcpEl: '', cls: 0 };
      new PerformanceObserver((l) => { const e = l.getEntries().at(-1); window.__perf.lcp = Math.round(e.startTime); window.__perf.lcpEl = (e.element && (e.element.tagName + '.' + e.element.className)) || '' }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__perf.cls += e.value }).observe({ type: 'layout-shift', buffered: true });`,
  })
  await b.viewport(W, H, { mobile: isMobile, touch: isMobile, dpr: isMobile ? 2 : 1 })
  console.log(`\n== ${W}x${H}${isMobile ? ' mobile+touch' : ''} ==\n`)

  /* 1. boot ---------------------------------------------------------------- */
  await boot()
  const variant = await b.eval(`document.querySelector('.hero-stage')?.dataset.variant`)
  check('hero boots in scroll mode', !!variant, `variant=${variant}`)
  check('expected variant for viewport', variant === (isMobile || W <= 767 || H > W ? 'mobile' : 'desktop'))
  let c = await counts()
  check('exactly one pin-spacer and one ScrollTrigger after boot (Strict Mode safe)', c.spacers === 1 && c.triggers === 1, JSON.stringify(c))
  check('no console errors on load', problems().length === 0, JSON.stringify(problems()))
  const ovTop = await b.eval(`document.documentElement.scrollWidth - innerWidth`)
  check('no horizontal overflow at the top of the page', ovTop <= 0, `overflow=${ovTop}px`)
  const perf = await b.eval(`JSON.stringify(window.__perf)`)
  console.log('     (dev-server lab numbers, indicative only)', perf)

  /* 2. forward / reverse symmetry ----------------------------------------- */
  const R = await range()
  // Arriving at the same scroll position from above and from below must draw the same
  // thing: same frame pair + blend (exact), and canvas pixels equal to within rasterizer
  // dither (no pixel off by more than 2 levels; the software rasterizer used by headless
  // Chrome varies by +-1 on a few hundred pixels even for a forced redraw of one state).
  const snap = async (p, tag) => {
    await b.scrollTo(Math.round(R * p))
    await b.sleep(1700)
    return b.eval(`(() => {
      const c = document.querySelector('.hero-canvas'); const x = c.getContext('2d')
      window.__snap = window.__snap || {}
      window.__snap[${JSON.stringify(tag)}] = x.getImageData(0, 0, c.width, c.height).data
      return window.__heroSeq ? window.__heroSeq.lastKey : ''
    })()`)
  }
  const compare = (a, d) =>
    b.eval(`(() => { const A = window.__snap[${JSON.stringify(a)}], B = window.__snap[${JSON.stringify(d)}]; let big = 0, small = 0; for (let k = 0; k < A.length; k += 4) { const m = Math.max(Math.abs(A[k] - B[k]), Math.abs(A[k+1] - B[k+1]), Math.abs(A[k+2] - B[k+2])); if (m > 2) big++; else if (m) small++ } return { big, small } })()`)
  const keys = {}
  for (const p of [0.3, 0.5, 0.7]) keys['f' + p] = await snap(p, 'f' + p)
  await snap(1, 'end')
  for (const p of [0.7, 0.5, 0.3]) keys['r' + p] = await snap(p, 'r' + p)
  for (const p of [0.3, 0.5, 0.7]) {
    const d = await compare('f' + p, 'r' + p)
    check(
      `forward == reverse at ${p * 100}% (same frame pair + blend, pixels within dither)`,
      keys['f' + p] === keys['r' + p] && d.big === 0,
      `key=${keys['f' + p]}  pixels off by >2 levels: ${d.big}, by 1-2 levels: ${d.small}`,
    )
  }
  const scrubbing = await compare('f0.3', 'f0.7')
  check('frame at 30% differs from 70% (it is really scrubbing)', scrubbing.big > 1000, `pixels that differ: ${scrubbing.big}`)

  /* 3. no sudden jumps ---------------------------------------------------- */
  await b.scrollTo(0)
  await b.sleep(1500)
  const STEPS = 48
  let prev = await tiny()
  const diffs = []
  for (let i = 1; i <= STEPS; i++) {
    await b.scrollTo(Math.round((R * i) / STEPS))
    await b.sleep(900)
    const cur = await tiny()
    let sum = 0
    for (let k = 0; k < cur.length; k++) sum += Math.abs(cur[k] - prev[k])
    diffs.push(sum / cur.length)
    prev = cur
  }
  const sorted = [...diffs].sort((a, d) => a - d)
  const med = sorted[Math.floor(sorted.length / 2)] || 0.0001
  const max = sorted.at(-1)
  check('no frame jumps: largest step change is not an outlier', max < Math.max(8, med * 12), `median=${med.toFixed(2)} max=${max.toFixed(2)} (mean abs RGB change per step)`)

  /* 4. flick test ---------------------------------------------------------- */
  const bandState = () =>
    b.eval(`JSON.stringify([1, 2, 3].map((n) => {
      const band = document.querySelector('.hero-band-' + n)
      const words = [...band.querySelectorAll('.hero-h .word')]
      const op = parseFloat(getComputedStyle(band).opacity)
      const rest = words.every((el) => { const m = new DOMMatrix(getComputedStyle(el).transform); return Math.abs(m.f) < 2 })
      return op >= 0.98 && rest
    }))`).then(JSON.parse)
  for (const step of [120, 240, 360]) {
    await b.scrollTo(0)
    await b.sleep(1800)
    const seen = [[], [], []]
    const maxSteps = Math.ceil((R + 200) / step)
    for (let i = 0; i <= maxSteps; i++) {
      await b.eval(`window.scrollBy(0, ${step})`)
      await b.sleep(750)
      const s = await bandState()
      s.forEach((v, k) => seen[k].push(v))
    }
    const longest = (arr) => arr.reduce((acc, v) => (v ? { run: acc.run + 1, best: Math.max(acc.best, acc.run + 1) } : { run: 0, best: acc.best }), { run: 0, best: 0 }).best
    const runs = seen.map(longest)
    // 120px is a normal wheel notch on desktop (need 5 per the 10k standard); a real touch
    // swipe covers several hundred px, so on a phone 3 notches is an equivalent reading time.
    const need = step === 120 ? (isMobile ? 3 : 5) : 1
    check(`flick ${step}px: every act readable for >= ${need} consecutive step(s)`, runs.every((r) => r >= need), `longest readable runs per act: ${runs.join(' / ')}`)
  }

  /* 5. CTA gating ---------------------------------------------------------- */
  await b.scrollTo(0)
  await b.sleep(1500)
  const liveEarly = await b.eval(`document.querySelector('.hero-stage').dataset.live`)
  await b.scrollTo(R)
  await b.sleep(1800)
  const liveLate = await b.eval(`document.querySelector('.hero-stage').dataset.live`)
  check('CTAs are inert early and live at the end', liveEarly === 'false' && liveLate === 'true', `early=${liveEarly} late=${liveLate}`)
  const hit = await b.eval(`(() => { const a = document.querySelector('.hero-band-3 .hero-cta a'); const r = a.getBoundingClientRect(); const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return a.contains(el) })()`)
  check('primary CTA is the element under the pointer at the end (not covered)', hit === true)
  const ovEnd = await b.eval(`document.documentElement.scrollWidth - innerWidth`)
  check('no horizontal overflow at the end of the pin', ovEnd <= 0, `overflow=${ovEnd}px`)

  /* 5b. real wheel input drives the scrub ---------------------------------- */
  await b.scrollTo(0)
  await b.sleep(1500)
  for (let i = 0; i < 12; i++) {
    await b.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: Math.round(W / 2), y: Math.round(H / 2), deltaX: 0, deltaY: 120 })
    await b.sleep(60)
  }
  await b.sleep(1500)
  const wheelY = await b.eval(`scrollY`)
  check('real mouse-wheel input scrolls the pinned hero', wheelY > 600, `scrollY after 12 wheel notches = ${Math.round(wheelY)}px`)

  /* 5c. keyboard: focusing a not-yet-visible CTA reveals the final state ------ */
  await b.scrollTo(0)
  await b.sleep(1500)
  await b.eval(`document.querySelector('.hero-band-3 .hero-cta a').focus()`)
  await b.sleep(2200)
  const kb = await b.eval(`JSON.stringify({ y: Math.round(scrollY), live: document.querySelector('.hero-stage').dataset.live, op: getComputedStyle(document.querySelector('.hero-band-3')).opacity })`)
  const kbo = JSON.parse(kb)
  check('keyboard focus on a CTA jumps the hero to its final state and reveals it', kbo.live === 'true' && parseFloat(kbo.op) > 0.95 && kbo.y >= R - 5, kb)

  /* 5d. skip link -------------------------------------------------------- */
  await b.scrollTo(0)
  await b.sleep(1200)
  await b.eval(`document.querySelector('.hero-skip').click()`)
  await b.sleep(700)
  const skipTop = await b.eval(`Math.round(document.getElementById('after-hero').getBoundingClientRect().top)`)
  check('"Skip the cleaning animation" lands on the section after the hero', Math.abs(skipTop) < 4, `section top = ${skipTop}px`)

  /* 6. route navigation cleanup ------------------------------------------- */
  let cleanOk = true
  for (let i = 0; i < 4; i++) {
    await b.eval(`document.querySelector('a[href="/about"]').click()`)
    await b.sleep(700)
    c = await counts()
    if (c.spacers !== 0 || c.triggers !== 0 || c.stages !== 0) cleanOk = false
    await b.eval(`history.back()`)
    await b.sleep(1800)
    c = await counts()
    if (c.spacers !== 1 || c.triggers !== 1 || c.canvases !== 1) cleanOk = false
  }
  check('4x Home -> About -> back leaves no duplicate/leaked ScrollTriggers', cleanOk, JSON.stringify(c))
  check('no console errors after navigation', problems().length === 0, JSON.stringify(problems()))

  /* 6b. mobile drawer ------------------------------------------------------ */
  if (W < 1024) {
    await b.scrollTo(0)
    await b.sleep(800)
    await b.eval(`document.querySelector('button[aria-controls="mobile-drawer"]').click()`)
    await b.sleep(500)
    const dr = JSON.parse(
      await b.eval(`JSON.stringify({ open: !document.getElementById('mobile-drawer').hidden, expanded: document.querySelector('button[aria-controls="mobile-drawer"]').getAttribute('aria-expanded'), locked: document.documentElement.classList.contains('no-scroll'), minTap: Math.round(Math.min(...[...document.querySelectorAll('#mobile-drawer a')].map((a) => a.getBoundingClientRect().height))) })`),
    )
    check('mobile drawer opens, locks page scroll, every link is >= 44px tall', dr.open && dr.expanded === 'true' && dr.locked && dr.minTap >= 44, JSON.stringify(dr))
    await b.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 })
    await b.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 })
    await b.sleep(500)
    const dc = JSON.parse(
      await b.eval(`JSON.stringify({ hidden: document.getElementById('mobile-drawer').hidden, locked: document.documentElement.classList.contains('no-scroll'), focusOnToggle: document.activeElement === document.querySelector('button[aria-controls="mobile-drawer"]') })`),
    )
    check('Escape closes the drawer, unlocks scroll and returns focus to the menu button', dc.hidden && !dc.locked && dc.focusOnToggle, JSON.stringify(dc))
  }

  /* 7. live reduced-motion flip (both directions) ------------------------- */
  await b.media([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await b.sleep(900)
  c = await counts()
  check('flip reduced-motion ON live: switches to static hero, pin removed', c.statics === 1 && c.spacers === 0 && c.triggers === 0, JSON.stringify(c))
  const staticCta = await b.eval(`!!document.querySelector('.hero-static .hero-cta a[href="/contact"]') && !!document.querySelector('.hero-static .hero-cta a[href="/services"]')`)
  check('static hero shows headline + both working CTAs', staticCta === true)
  await b.media([])
  await b.sleep(1500)
  c = await counts()
  check('flip reduced-motion OFF live: scroll hero re-arms', c.spacers === 1 && c.triggers === 1 && c.statics === 0, JSON.stringify(c))

  /* 8. reduced motion at load: no sequence downloaded ---------------------- */
  await b.media([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await boot()
  const frameReqs = await b.eval(`performance.getEntriesByType('resource').filter((e) => e.initiatorType === 'img' && /hero\\/(desktop|mobile)\\/frame-/.test(e.name)).length`)
  check('reduced motion at load downloads exactly 1 hero frame (the static one)', frameReqs === 1, `frames requested: ${frameReqs}`)
  await b.media([])

  /* 9. missing frames ------------------------------------------------------ */
  await b.blockImages([/hero\/(desktop|mobile)\/frame-001\.webp/])
  await boot()
  c = await counts()
  check('first frame blocked: falls back to static hero (page still complete)', c.statics === 1 && c.spacers === 0, JSON.stringify(c))
  await b.blockImages([/hero\/(desktop|mobile)\/frame-/])
  await boot()
  const ctas = await b.eval(`document.querySelectorAll('.hero-static .hero-cta a').length`)
  check('ALL hero images blocked: copy + CTAs still present and usable', ctas === 2, `ctas=${ctas}`)
  await b.blockImages([])
} finally {
  const failed = results.filter((r) => !r.ok).length
  console.log(`\n${results.length - failed}/${results.length} checks passed`)
  await b.close()
  process.exit(failed ? 1 : 0)
}
