/**
 * Behaviour checks for the homepage sections and the contact form, in a real headless Chrome.
 *   node scripts/qa/sections-behaviour.mjs [baseUrl=http://localhost:5173] [width=1440] [height=900] [mobile=0]
 * Exit code is non-zero if any check fails.
 */
import { launch } from './cdp.mjs'

const [base = 'http://localhost:5173', w = '1440', h = '900', mobile = '0'] = process.argv.slice(2)
const isMobile = mobile === '1'
const b = await launch({ port: 9391 })
let failed = 0
const check = (name, ok, extra = '') => {
  if (!ok) failed++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  ' + extra : ''}`)
}
const ev = (s) => b.eval(s)
const center = async (sel) => JSON.parse(await ev(`(() => { const r = document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect(); return JSON.stringify({ x: r.left + r.width / 2, y: r.top + r.height / 2, left: r.left, width: r.width, top: r.top, height: r.height }) })()`))
const scrollToSel = async (sel) => {
  await ev(`document.querySelector(${JSON.stringify(sel)}).scrollIntoView({ block: 'center' })`)
  await b.sleep(1100)
}
const mouse = (type, x, y, extra = {}) => b.send('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: type === 'mouseReleased' ? 0 : 1, clickCount: 1, ...extra })
const touch = (type, pts) => b.send('Input.dispatchTouchEvent', { type, touchPoints: pts })
const pos = async () => +(await ev(`document.querySelector('[role=slider]').getAttribute('aria-valuenow')`))

try {
  await b.viewport(+w, +h, { mobile: isMobile, touch: isMobile, dpr: isMobile ? 2 : 1 })
  await b.goto(base + '/')
  await b.sleep(2500)

  // ---------- before/after slider ----------
  await scrollToSel('.compare')
  check('slider starts at 50', (await pos()) === 50)
  const c = await center('.compare')
  if (!isMobile) {
    await mouse('mousePressed', c.x, c.y)
    await mouse('mouseMoved', c.left + c.width * 0.8, c.y)
    await mouse('mouseReleased', c.left + c.width * 0.8, c.y)
    const p = await pos()
    check('mouse drag moves the handle to ~80', Math.abs(p - 80) <= 2, `got ${p}`)
  } else {
    await touch('touchStart', [{ x: c.x, y: c.y, id: 1 }])
    await touch('touchMove', [{ x: c.left + c.width * 0.25, y: c.y, id: 1 }])
    await touch('touchEnd', [])
    const p = await pos()
    check('touch drag moves the handle to ~25', Math.abs(p - 25) <= 3, `got ${p}`)
  }
  await ev(`document.querySelector('[role=slider]').focus()`)
  await b.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Home', code: 'Home', windowsVirtualKeyCode: 36 })
  await b.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Home', code: 'Home', windowsVirtualKeyCode: 36 })
  check('Home key sets 0', (await pos()) === 0)
  for (let i = 0; i < 3; i++) {
    await b.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 })
    await b.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 })
  }
  check('3x ArrowRight adds 6', (await pos()) === 6)
  await b.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'End', code: 'End', windowsVirtualKeyCode: 35 })
  check('End key sets 100', (await pos()) === 100)
  const srcBefore = await ev(`document.querySelector('.compare img').src`)
  await ev(`[...document.querySelectorAll('button[aria-pressed]')].find((x) => x.textContent === 'Kitchen').click()`)
  await b.sleep(300)
  const srcAfter = await ev(`document.querySelector('.compare img').src`)
  check('room tab swaps the images and resets to 50', srcBefore !== srcAfter && (await pos()) === 50)
  check('demonstration label is visible', (await ev(`document.body.innerText.includes('Demonstration images')`)) === true)

  // ---------- cleaning video ----------
  await scrollToSel('#video video')
  check('video does not download until played (preload none, nothing buffered)', (await ev(`(() => { const v = document.querySelector('#video video'); return v.preload === 'none' && v.readyState === 0 })()`)) === true)
  check('video has a poster image and no controls before play', (await ev(`(() => { const v = document.querySelector('#video video'); return v.poster.endsWith('bright-living-room-poster.webp') && !v.controls })()`)) === true)
  check('video never autoplays', (await ev(`document.querySelector('#video video').paused`)) === true)
  check('play button is a labelled button', (await ev(`document.querySelector('#video button')?.getAttribute('aria-label')`)).startsWith('Play video'))
  await ev(`document.querySelector('#video button').click()`)
  await b.sleep(2500)
  check('pressing play starts the video', (await ev(`(() => { const v = document.querySelector('#video video'); return !v.paused && v.currentTime > 0.3 })()`)) === true)
  check('controls appear after play and the play button is gone', (await ev(`(() => document.querySelector('#video video').controls && !document.querySelector('#video button'))()`)) === true)
  check('the video file is served', (await ev(`fetch('/videos/bright-living-room.mp4', { method: 'HEAD' }).then((r) => r.ok && r.headers.get('content-type').includes('video'))`)) === true)

  // ---------- FAQ ----------
  await scrollToSel('#faq-q-0')
  check('FAQ closed by default', (await ev(`document.getElementById('faq-q-0').getAttribute('aria-expanded')`)) === 'false')
  check('closed answer is inert', (await ev(`document.getElementById('faq-a-0').inert`)) === true)
  await ev(`document.getElementById('faq-q-0').click()`)
  await b.sleep(700)
  check('FAQ opens', (await ev(`document.getElementById('faq-q-0').getAttribute('aria-expanded')`)) === 'true' && (await ev(`document.getElementById('faq-a-0').inert`)) === false)
  const aH = await ev(`document.getElementById('faq-a-0').getBoundingClientRect().height`)
  check('opened answer has height', aH > 40, `${Math.round(aH)}px`)
  await ev(`document.getElementById('faq-q-0').click()`)
  await b.sleep(700)
  check('FAQ closes again', (await ev(`document.getElementById('faq-q-0').getAttribute('aria-expanded')`)) === 'false')

  // ---------- testimonials ----------
  await scrollToSel('#reviews')
  const reviewCount = await ev(`document.querySelectorAll('#reviews ul > li').length`)
  check('testimonials render as cards', reviewCount >= 3, `${reviewCount} cards`)
  check('sample-review notice is shown on the demo', (await ev(`document.querySelector('#reviews').innerText.includes('Sample reviews')`)) === true)

  // ---------- estimator -> contact transfer ----------
  await scrollToSel('#est-service')
  const r1 = await ev(`document.querySelector('#est-result-title + p').innerText`)
  await ev(`(() => { const s = document.getElementById('est-service'); s.value = 'office'; s.dispatchEvent(new Event('change', { bubbles: true })) })()`)
  await b.sleep(300)
  const r2 = await ev(`document.querySelector('#est-result-title + p').innerText`)
  check('estimate changes with the service', r1 !== r2, `${r1.replace(/\n/g, ' ')} -> ${r2.replace(/\n/g, ' ')}`)
  check('demonstration label shown on the estimate', (await ev(`document.body.innerText.includes('Demonstration estimate')`)) === true)
  await ev(`[...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Request My Quote').click()`)
  await b.sleep(1500)
  check('Request My Quote opens /contact', (await ev('location.pathname')) === '/contact')
  check('service carried over to the form', (await ev(`document.getElementById('f-service').value`)) === 'office-commercial-cleaning')
  check('message carries the estimator summary', (await ev(`document.getElementById('f-message').value`)).includes('Office & Commercial Cleaning'))

  // ---------- contact form ----------
  await ev(`document.getElementById('f-message').value = ''`)
  await ev(`document.querySelector('form button[type=submit]').click()`)
  await b.sleep(700)
  const errs = await ev(`document.querySelectorAll('[role=alert] li').length`)
  check('empty submit shows an error summary', errs >= 3, `${errs} errors`)
  check('focus moves to the error summary', (await ev(`document.activeElement?.getAttribute('role')`)) === 'alert')
  check('invalid fields are flagged for assistive tech', (await ev(`document.getElementById('f-name').getAttribute('aria-invalid')`)) === 'true')
  check('no success message after an invalid submit', (await ev(`document.body.innerText.includes('ready to send')`)) === false)

  const fill = async (id, v) => ev(`(() => { const e = document.getElementById(${JSON.stringify(id)}); const proto = e.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(e, ${JSON.stringify(v)}); e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })) })()`)
  await fill('f-name', 'Test Person')
  await fill('f-phone', '613 555 0100')
  await fill('f-email', 'not-an-email')
  await fill('f-message', 'Two-storey house, about 1,800 sq ft.')
  await ev(`document.querySelector('form button[type=submit]').click()`)
  await b.sleep(600)
  check('bad email is rejected with a message', (await ev(`document.getElementById('f-email-error')?.innerText || ''`)).includes('valid email'))
  await fill('f-email', 'test@example.com')
  await ev(`document.querySelector('form button[type=submit]').click()`)
  await b.sleep(900)
  const body = await ev('document.body.innerText')
  check('valid submit prepares the request (no endpoint)', body.includes('Your request is ready to send.'))
  check('it says plainly that nothing has been sent', body.includes('It has not been sent yet'))
  const wa = await ev(`[...document.querySelectorAll('a')].find((a) => a.textContent.includes('Send on WhatsApp'))?.href || ''`)
  check('WhatsApp link targets the business number with the message', wa.startsWith('https://wa.me/16136952579?text=') && wa.includes('Test%20Person'), wa.slice(0, 70))
  const mail = await ev(`[...document.querySelectorAll('a')].find((a) => a.textContent.includes('Send by email'))?.href || ''`)
  check('email link is a mailto to the owner with the message', mail.startsWith('mailto:marthaargaw0@gmail.com') && mail.includes('Test%20Person'))

  // ---------- count-up ----------
  await b.goto(base + '/')
  await b.sleep(2000)
  const numeral = `#after-hero [aria-hidden="true"].font-display span`
  const before = await ev(`document.querySelector(${JSON.stringify(numeral)}).textContent`)
  check('count-up waits at 0 until it is on screen', before === '0', `shows "${before}"`)
  await ev(`document.querySelector(${JSON.stringify(numeral)}).scrollIntoView({ block: 'center' })`)
  const seen = []
  for (let i = 0; i < 24; i++) {
    seen.push(await ev(`document.querySelector(${JSON.stringify(numeral)}).textContent`))
    await b.sleep(100)
  }
  const nums = seen.map(Number)
  const target = nums.at(-1)
  check('count-up ends on the real number (8)', target === 8, seen.join(','))
  check('count-up passes through intermediate values', new Set(nums).size >= 4, `${new Set(nums).size} distinct`)
  check('count-up never goes backwards', nums.every((n, i) => i === 0 || n >= nums[i - 1]))
  check('screen readers get the real number, not the animation', (await ev(`document.querySelector('#after-hero .sr-only').textContent.trim().startsWith('8')`)) === true)
  await b.media([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await b.goto(base + '/')
  await b.sleep(2000)
  check('reduced motion: the final number is shown straight away', (await ev(`document.querySelector(${JSON.stringify(numeral)}).textContent`)) === '8')
  await b.media([])

  // ---------- gallery page has no photo-credit block ----------
  await b.goto(base + '/gallery')
  await b.sleep(1500)
  check('gallery page has no photo credits', (await ev(`document.body.innerText.toLowerCase().includes('photo credits')`)) === false)
  check('gallery page still labels the demonstration images', (await ev(`document.body.innerText.includes('Demonstration images')`)) === true)

  // ---------- About button goes to the quote page ----------
  await b.goto(base + '/')
  await b.sleep(2000)
  const aboutHref = await ev(`document.querySelector('#about a[href]')?.getAttribute('href')`)
  const aboutLabel = await ev(`document.querySelector('#about a[href]')?.textContent.trim()`)
  check('About button leads to the quote page', aboutHref === '/contact' && /quote/i.test(aboutLabel), `${aboutLabel} -> ${aboutHref}`)

  // ---------- new owner details everywhere ----------
  // textContent, not innerText: sections skipped by content-visibility have no rendered text yet
  const html = await ev('document.body.textContent')
  check('no trace of the previous business name', !/VitaGrace/i.test(html))
  check('new business name and owner appear', html.includes('Mercy Solution') && html.includes('Martha Argaw'))
  const links = JSON.parse(await ev(`JSON.stringify([...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')))`))
  check('phone, WhatsApp and email links use the new details',
    links.some((l) => l === 'tel:+16136952579') && links.some((l) => l.startsWith('https://wa.me/16136952579')) && links.some((l) => l === 'mailto:marthaargaw0@gmail.com'))
  check('no link still points at the old number or email', !links.some((l) => /16138534419|goldenmart43/.test(l)))

  // ---------- reveal safety ----------
  await b.media([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await b.goto(base + '/')
  await b.sleep(2000)
  check('reduced motion: nothing is left hidden by reveal', (await ev(`document.querySelectorAll('[data-reveal="pending"]').length`)) === 0)
  await b.media([])

  const issues = b.logs.filter((l) => ['error', 'exception'].includes(l.type))
  check('no console errors', issues.length === 0, JSON.stringify(issues).slice(0, 300))
} finally {
  console.log(`\n${failed} check(s) failed`)
  await b.close()
}
process.exit(failed ? 1 : 0)
