/**
 * Main-thread trace summary of page load under 4x CPU throttle: where does the time go
 * (script, style recalc, layout, paint, image decode, GC)?
 *   node scripts/qa/perf-trace.mjs [url=http://localhost:4173/] [width=412] [height=823] [dpr=1.75] [seconds=7]
 */
import { launch } from './cdp.mjs'

const [url = 'http://localhost:4173/', w = '412', h = '823', dpr = '1.75', secs = '7'] = process.argv.slice(2)
const b = await launch({ port: 9400 })
const events = []
b.on('Tracing.dataCollected', (p) => events.push(...p.value))
try {
  await b.viewport(+w, +h, { mobile: true, touch: true, dpr: +dpr })
  await b.send('Emulation.setCPUThrottlingRate', { rate: 4 })
  // INJECT_CSS="<css>" experiments with style overrides without rebuilding
  if (process.env.INJECT_CSS) {
    await b.send('Page.addScriptToEvaluateOnNewDocument', {
      source: `document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = ${JSON.stringify(process.env.INJECT_CSS)}; document.head.appendChild(s) })`,
    })
  }
  const done = new Promise((res) => b.on('Tracing.tracingComplete', res))
  await b.send('Tracing.start', {
    categories: 'devtools.timeline,v8.execute,disabled-by-default-devtools.timeline,blink.user_timing',
    transferMode: 'ReportEvents',
  })
  await b.goto(url)
  await b.sleep(+secs * 1000)
  await b.send('Tracing.end')
  await done

  const main = events.filter((e) => e.ph === 'X' && e.dur)
  const mainTid = (() => {
    const c = new Map()
    main.filter((e) => e.name === 'RunTask').forEach((e) => c.set(e.tid, (c.get(e.tid) || 0) + e.dur))
    return [...c.entries()].sort((a, d) => d[1] - a[1])[0]?.[0]
  })()
  const mt = main.filter((e) => e.tid === mainTid)
  const sum = (names) => mt.filter((e) => names.includes(e.name)).reduce((s, e) => s + e.dur, 0) / 1000
  console.log('main-thread time (ms, 4x throttled):')
  for (const [label, names] of [
    ['RunTask (all)', ['RunTask']],
    ['EvaluateScript + FunctionCall', ['EvaluateScript', 'v8.run', 'FunctionCall']],
    ['UpdateLayoutTree (style recalc)', ['UpdateLayoutTree']],
    ['Layout', ['Layout']],
    ['Paint + Layerize + Commit', ['Paint', 'PrePaint', 'Layerize', 'Commit', 'UpdateLayer']],
    ['Image decode / resize', ['Decode Image', 'ImageDecodeTask', 'Draw LazyPixelRef', 'Decode LazyPixelRef']],
    ['GC', ['MajorGC', 'MinorGC', 'V8.GC_MC_BACKGROUND_SWEEPING', 'BlinkGC.AtomicPhase']],
    ['ParseHTML', ['ParseHTML']],
  ]) console.log('  ' + label.padEnd(36) + sum(names).toFixed(0).padStart(7))

  console.log('\nlargest tasks:')
  mt.filter((e) => e.name === 'RunTask')
    .sort((x, y) => y.dur - x.dur)
    .slice(0, 6)
    .forEach((t) => {
      const inner = mt.filter((e) => e.ts >= t.ts && e.ts + e.dur <= t.ts + t.dur && e.name !== 'RunTask')
      const agg = {}
      inner.forEach((e) => (agg[e.name] = (agg[e.name] || 0) + e.dur))
      const top = Object.entries(agg).sort((x, y) => y[1] - x[1]).slice(0, 5).map(([k, v]) => `${k} ${(v / 1000).toFixed(0)}`).join(', ')
      console.log(`  ${(t.dur / 1000).toFixed(0).padStart(5)}ms  inner(top): ${top}`)
    })

  // LAYOUT-DETAIL: the individual slow layouts and what they covered
  console.log('\nslow Layout events (>15ms, throttled):')
  mt.filter((e) => e.name === 'Layout' && e.dur > 15000)
    .sort((x, y) => y.dur - x.dur)
    .slice(0, 6)
    .forEach((e) => console.log('  ' + (e.dur / 1000).toFixed(0).padStart(5) + 'ms', JSON.stringify(e.args?.beginData ?? {}), JSON.stringify(e.args?.endData ?? {}).slice(0, 160)))

  const imgDecode = events.filter((e) => /Decode|ImageDecode/i.test(e.name) && e.ph === 'X' && e.dur)
  console.log('\nimage decode events (any thread):', imgDecode.length, ' total ms', (imgDecode.reduce((s, e) => s + e.dur, 0) / 1000).toFixed(0))
} finally {
  await b.close()
}
