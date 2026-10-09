/**
 * Canvas frame-sequence player.
 *
 * - Loads the first frame immediately (it is the LCP image), then the rest
 *   progressively, coarse to fine (every 8th, 4th, 2nd, then all), so scrubbing
 *   works at low fidelity long before the full set has arrived.
 * - draw(position) blends the two nearest *loaded* frames on the canvas, so
 *   motion is continuous even while frames are still downloading, and there are
 *   never visible frame "jumps" between sparse keyframes.
 * - Nothing is written to the canvas unless the result would change (delta-gated).
 * - Every loader, observer and listener is torn down by destroy(), so React
 *   Strict Mode's double mount and route changes cannot leak work.
 */
export function createFrameSequence({
  urls,
  canvas,
  maxPixels = 2_400_000,
  focus = { x: 0.5, y: 0.5 },
  concurrency = 3,
  onFirstFrame,
  onError,
  onProgress,
}) {
  const count = urls.length
  const images = new Array(count).fill(null)
  let loaded = 0
  let destroyed = false
  let ctx = canvas.getContext('2d', { alpha: false })
  let cssW = 0
  let cssH = 0
  let lastKey = ''
  let lastPosition = 0
  let firstFrameFired = false
  const controllers = new Set()

  /* ---------------------------------------------------------- loading ---- */
  function loadOrder() {
    const seen = new Set()
    const order = []
    const add = (i) => {
      if (i >= 0 && i < count && !seen.has(i)) {
        seen.add(i)
        order.push(i)
      }
    }
    add(0)
    add(count - 1)
    const saveData = typeof navigator !== 'undefined' && navigator.connection?.saveData
    const strides = saveData ? [8, 4, 2] : [8, 4, 2, 1]
    for (const stride of strides) for (let i = 0; i < count; i += stride) add(i)
    return order
  }

  function loadFrame(index) {
    return new Promise((resolve) => {
      const img = new Image()
      img.decoding = 'async'
      const done = (ok) => {
        controllers.delete(abort)
        resolve(ok ? img : null)
      }
      const abort = () => {
        img.src = ''
        resolve(null)
      }
      controllers.add(abort)
      img.onload = () => {
        // decode() keeps the first draw from stalling on the main thread.
        const d = img.decode ? img.decode().catch(() => {}) : Promise.resolve()
        d.then(() => done(true))
      }
      img.onerror = () => done(false)
      img.src = urls[index]
    })
  }

  async function run() {
    if (!count) {
      onError?.(new Error('No frames configured'))
      return
    }
    const order = loadOrder()

    // 1. First frame, alone and first: it gates the reveal.
    const first = await loadFrame(order[0])
    if (destroyed) return
    if (!first) {
      onError?.(new Error('First frame failed to load'))
      return
    }
    images[order[0]] = first
    loaded++
    render(true)
    if (!firstFrameFired) {
      firstFrameFired = true
      onFirstFrame?.()
    }

    // 2. The rest, once the browser is idle, a few at a time.
    await new Promise((r) =>
      'requestIdleCallback' in window ? window.requestIdleCallback(r, { timeout: 1200 }) : setTimeout(r, 250),
    )
    let cursor = 1
    const worker = async () => {
      while (!destroyed && cursor < order.length) {
        const index = order[cursor++]
        const img = await loadFrame(index)
        if (destroyed) return
        if (img) {
          images[index] = img
          loaded++
          onProgress?.(loaded / count)
          // Redraw only if this frame can change what is on screen.
          render(false)
        }
      }
    }
    await Promise.all(Array.from({ length: concurrency }, worker))
  }

  /* --------------------------------------------------------- drawing ----- */
  function nearestLoaded(from, step) {
    for (let i = from; i >= 0 && i < count; i += step) if (images[i]) return i
    return -1
  }

  function resize() {
    if (destroyed) return
    const rect = canvas.getBoundingClientRect()
    cssW = Math.max(1, Math.round(rect.width))
    cssH = Math.max(1, Math.round(rect.height))
    let k = Math.min(window.devicePixelRatio || 1, 2)
    let w = cssW * k
    let h = cssH * k
    if (w * h > maxPixels) {
      const r = Math.sqrt(maxPixels / (w * h))
      w *= r
      h *= r
    }
    w = Math.round(w)
    h = Math.round(h)
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
      ctx = canvas.getContext('2d', { alpha: false })
      lastKey = '' // force a repaint after the buffer was cleared
    }
    render(true)
  }

  function drawCover(img, alpha) {
    const cw = canvas.width
    const ch = canvas.height
    const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
    const dw = img.naturalWidth * s
    const dh = img.naturalHeight * s
    const dx = (cw - dw) * focus.x
    const dy = (ch - dh) * focus.y
    ctx.globalAlpha = alpha
    // 1px overscan: if the destination lands on fractional pixels, edge pixels would
    // be only partly covered and blend with whatever was drawn before, which makes the
    // output depend on scroll history (forward != reverse by a level or two).
    ctx.drawImage(img, dx - 1, dy - 1, dw + 2, dh + 2)
  }

  /** position: 0..1 across the whole sequence. */
  function draw(position) {
    lastPosition = position
    render(false)
  }

  function render(force) {
    if (destroyed || !count) return
    const f = Math.min(count - 1, Math.max(0, lastPosition * (count - 1)))
    let lo = nearestLoaded(Math.floor(f), -1)
    let hi = nearestLoaded(Math.ceil(f), 1)
    if (lo === -1 && hi === -1) return
    if (lo === -1) lo = hi
    if (hi === -1) hi = lo
    const w = hi === lo ? 0 : (f - lo) / (hi - lo)
    const wq = Math.round(w * 200) / 200 // quantise blend so sub-pixel scroll jitter is a no-op
    const key = `${lo}|${hi}|${wq}|${canvas.width}x${canvas.height}`
    if (!force && key === lastKey) return
    lastKey = key
    ctx.imageSmoothingQuality = 'high'
    drawCover(images[lo], 1)
    if (wq > 0 && hi !== lo) drawCover(images[hi], wq)
    ctx.globalAlpha = 1
  }

  /* ----------------------------------------------------------- setup ----- */
  const ro = new ResizeObserver(() => resize())
  ro.observe(canvas)
  resize()
  run().catch((e) => !destroyed && onError?.(e))

  return {
    draw,
    resize,
    get loadedCount() {
      return loaded
    },
    get frameCount() {
      return count
    },
    /** `lo|hi|blend|WxH` of the last paint: lets tests prove two scroll paths drew the same thing. */
    get lastKey() {
      return lastKey
    },
    destroy() {
      destroyed = true
      ro.disconnect()
      controllers.forEach((abort) => abort())
      controllers.clear()
      images.fill(null)
    },
  }
}
