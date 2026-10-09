/**
 * Tiny Chrome DevTools Protocol harness (no dependencies; Node 22+ has a global WebSocket).
 * Drives the machine's own installed Chrome headlessly so scroll/animation behaviour
 * is tested in a real, visible, compositing browser, with real touch + media emulation.
 *
 *   import { launch } from './cdp.mjs'
 *   const b = await launch()
 *   await b.viewport(1440, 900)
 *   await b.goto('http://localhost:5173/')
 *   console.log(await b.eval('document.title'))
 *   await b.shot('out.png')
 *   await b.close()
 */
import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const CHROME =
  process.env.CHROME_PATH ||
  [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ].find((p) => existsSync(p)) ||
  'chrome'

export async function launch({ port = 9333 } = {}) {
  const profile = mkdtempSync(path.join(os.tmpdir(), 'cdp-profile-'))
  const proc = spawn(
    CHROME,
    [
      '--headless=new',
      '--disable-gpu',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      '--window-size=1440,900',
      'about:blank',
    ],
    { stdio: 'ignore' },
  )

  let targets = []
  for (let i = 0; i < 60; i++) {
    try {
      targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
      if (targets.some((t) => t.type === 'page')) break
    } catch {
      /* not up yet */
    }
    await sleep(250)
  }
  const target = targets.find((t) => t.type === 'page')
  if (!target) throw new Error('Chrome did not expose a page target')

  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((res, rej) => {
    ws.addEventListener('open', res, { once: true })
    ws.addEventListener('error', rej, { once: true })
  })

  let nextId = 0
  const pending = new Map()
  const waiters = []
  const logs = []
  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data)
    if (m.id && pending.has(m.id)) {
      const { res, rej } = pending.get(m.id)
      pending.delete(m.id)
      if (m.error) rej(new Error(`${m.error.message} ${m.error.data ?? ''}`))
      else res(m.result)
      return
    }
    if (m.method === 'Runtime.consoleAPICalled') {
      logs.push({
        type: m.params.type,
        text: m.params.args.map((a) => a.value ?? a.description ?? '').join(' '),
      })
    } else if (m.method === 'Runtime.exceptionThrown') {
      logs.push({ type: 'exception', text: m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text })
    } else if (m.method === 'Log.entryAdded') {
      logs.push({ type: m.params.entry.level, text: `${m.params.entry.text} ${m.params.entry.url ?? ''}` })
    }
    for (let i = waiters.length - 1; i >= 0; i--) if (waiters[i].method === m.method) waiters.splice(i, 1)[0].res(m.params)
    for (const fn of subscribers.get(m.method) ?? []) fn(m.params)
  })
  const subscribers = new Map()

  const send = (method, params = {}) =>
    new Promise((res, rej) => {
      const id = ++nextId
      pending.set(id, { res, rej })
      ws.send(JSON.stringify({ id, method, params }))
    })

  // image-only request blocking (Network.setBlockedURLs cannot tell an <img> from a
  // dev-server module request for the same file, which would break the app itself)
  let imageBlockPatterns = []
  ws.addEventListener('message', async (ev) => {
    const m = JSON.parse(ev.data)
    if (m.method !== 'Fetch.requestPaused') return
    const { requestId, request } = m.params
    const blocked = imageBlockPatterns.some((re) => re.test(request.url))
    try {
      if (blocked) await send('Fetch.failRequest', { requestId, errorReason: 'Failed' })
      else await send('Fetch.continueRequest', { requestId })
    } catch {
      /* page navigated away */
    }
  })
  const waitFor = (method, timeout = 20000) =>
    new Promise((res, rej) => {
      const t = setTimeout(() => rej(new Error(`timeout waiting for ${method}`)), timeout)
      waiters.push({ method, res: (p) => (clearTimeout(t), res(p)) })
    })

  await send('Page.enable')
  await send('Runtime.enable')
  await send('Log.enable')
  await send('Network.enable')

  const api = {
    send,
    logs,
    /** Subscribe to a CDP event, e.g. on('Tracing.dataCollected', (p) => ...). */
    on(method, fn) {
      subscribers.set(method, [...(subscribers.get(method) ?? []), fn])
    },
    async goto(url) {
      const loaded = waitFor('Page.loadEventFired')
      await send('Page.navigate', { url })
      await loaded
    },
    async eval(expression) {
      const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text)
      return r.result.value
    },
    async viewport(width, height, { mobile = false, dpr = 1, touch = false } = {}) {
      await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dpr, mobile })
      await send('Emulation.setTouchEmulationEnabled', { enabled: touch, maxTouchPoints: 5 })
    },
    /** media: e.g. [{ name: 'prefers-reduced-motion', value: 'reduce' }] */
    async media(features = []) {
      await send('Emulation.setEmulatedMedia', { features })
    },
    async blockUrls(urls) {
      await send('Network.setBlockedURLs', { urls })
    },
    /** Fail only IMAGE requests whose URL matches one of the regexes (pass [] to stop). */
    async blockImages(regexes = []) {
      imageBlockPatterns = regexes
      if (regexes.length) await send('Fetch.enable', { patterns: [{ urlPattern: '*', resourceType: 'Image' }] })
      else await send('Fetch.disable')
    },
    /** Returns a PNG Buffer. `clip` is {x,y,width,height} in CSS px. */
    async shotBuffer({ clip } = {}) {
      const params = { format: 'png' }
      if (clip) params.clip = { ...clip, scale: 1 }
      const { data } = await send('Page.captureScreenshot', params)
      return Buffer.from(data, 'base64')
    },
    async shot(file, { fullPage = false } = {}) {
      const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: fullPage })
      writeFileSync(file, Buffer.from(data, 'base64'))
    },
    async scrollTo(y) {
      await api.eval(`window.scrollTo(0, ${y})`)
    },
    sleep,
    async close() {
      try {
        await send('Browser.close')
      } catch {
        /* closing */
      }
      ws.close()
      proc.kill()
      await sleep(300)
      try {
        rmSync(profile, { recursive: true, force: true })
      } catch {
        /* profile may be locked briefly */
      }
    },
  }
  return api
}
