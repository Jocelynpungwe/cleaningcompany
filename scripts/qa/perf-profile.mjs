/**
 * CPU profile of page load under 4x CPU throttling (approximates Lighthouse's mobile run).
 *   npx vite build --minify false --outDir dist-profile && npx vite preview --outDir dist-profile --port 4174
 *   node scripts/qa/perf-profile.mjs http://localhost:4174/ [width=412] [height=823] [dpr=1.75] [seconds=7]
 * Prints top self-time functions + long animation frames with script attribution.
 */
import { launch } from './cdp.mjs'

const [url = 'http://localhost:4174/', w = '412', h = '823', dpr = '1.75', secs = '7'] = process.argv.slice(2)
const b = await launch({ port: 9399 })
try {
  await b.viewport(+w, +h, { mobile: true, touch: true, dpr: +dpr })
  await b.send('Emulation.setCPUThrottlingRate', { rate: 4 })
  await b.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `window.__loaf = []; window.__lt = [];
      try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__loaf.push({ start: Math.round(e.startTime), dur: Math.round(e.duration), block: Math.round(e.blockingDuration || 0), scripts: (e.scripts || []).map((s) => ({ fn: s.sourceFunctionName || s.invoker, url: (s.sourceURL || '').split('/').pop(), dur: Math.round(s.duration), forced: Math.round(s.forcedStyleAndLayoutDuration || 0) })) }) }).observe({ type: 'long-animation-frame', buffered: true }) } catch (e) {}
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lt.push([Math.round(e.startTime), Math.round(e.duration)]) }).observe({ type: 'longtask', buffered: true });`,
  })
  await b.send('Profiler.enable')
  await b.send('Profiler.setSamplingInterval', { interval: 500 })
  await b.send('Profiler.start')
  await b.goto(url)
  await b.sleep(+secs * 1000)
  const { profile } = await b.send('Profiler.stop')

  // aggregate self time per call frame
  const byId = new Map(profile.nodes.map((n) => [n.id, n]))
  const self = new Map()
  const dt = profile.timeDeltas
  profile.samples.forEach((id, i) => {
    const n = byId.get(id)
    const cf = n.callFrame
    const key = `${cf.functionName || '(anonymous)'}  ${cf.url.split('/').pop() || '(native)'}:${cf.lineNumber + 1}`
    self.set(key, (self.get(key) || 0) + (dt[i] || 0))
  })
  const total = [...self.values()].reduce((s, v) => s + v, 0)
  console.log(`total sampled: ${Math.round(total / 1000)}ms (CPU throttled 4x)\n`)
  ;[...self.entries()]
    .sort((x, y) => y[1] - x[1])
    .slice(0, 22)
    .forEach(([k, v]) => console.log(String(Math.round(v / 1000)).padStart(6) + ' ms  ' + k))

  console.log('\nlong tasks [start, dur]:', JSON.stringify(await b.eval('window.__lt')))
  const loaf = await b.eval('window.__loaf')
  console.log('\nlong animation frames:')
  loaf.slice(0, 12).forEach((f) => {
    console.log(`  @${f.start}ms dur=${f.dur} blocking=${f.block}`)
    f.scripts.slice(0, 4).forEach((s) => console.log(`       ${s.fn || '(top-level)'} ${s.url} ${s.dur}ms forcedLayout=${s.forced}ms`))
  })
} finally {
  await b.close()
}
