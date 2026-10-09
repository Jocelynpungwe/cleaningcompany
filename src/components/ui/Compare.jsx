import { useCallback, useRef, useState } from 'react'
import { ChevronsLeftRight } from 'lucide-react'

const clamp = (n, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, n))

/**
 * Draggable before/after comparison.
 * - Pointer events (mouse, touch, pen) with capture; `touch-action: pan-y` keeps vertical page scroll.
 * - Keyboard: the handle is a `role="slider"`: arrows (+Shift for big steps), Home, End, PageUp/PageDown.
 * - Both images are real <img> elements, so they stay visible with CSS clip support missing or reduced motion.
 * - Give it a `key` per image pair so the handle returns to the middle when the pair changes.
 */
export default function Compare({ before, after, alt, label = 'Before and after comparison' }) {
  const [pos, setPos] = useState(50)
  const [dragging, setDragging] = useState(false)
  const [hint, setHint] = useState(true)
  const box = useRef(null)

  const fromX = useCallback((clientX) => {
    const r = box.current.getBoundingClientRect()
    setPos(clamp(((clientX - r.left) / r.width) * 100))
  }, [])

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    box.current.setPointerCapture(e.pointerId)
    setDragging(true)
    setHint(false)
    fromX(e.clientX)
  }
  const onPointerMove = (e) => dragging && fromX(e.clientX)
  const end = (e) => {
    if (box.current?.hasPointerCapture(e.pointerId)) box.current.releasePointerCapture(e.pointerId)
    setDragging(false)
  }

  const onKeyDown = (e) => {
    const big = e.shiftKey ? 10 : 2
    const map = {
      ArrowLeft: pos - big,
      ArrowDown: pos - big,
      ArrowRight: pos + big,
      ArrowUp: pos + big,
      PageDown: pos - 10,
      PageUp: pos + 10,
      Home: 0,
      End: 100,
    }
    if (e.key in map) {
      e.preventDefault()
      setHint(false)
      setPos(clamp(map[e.key]))
    }
  }

  const rounded = Math.round(pos)
  return (
    <div
      ref={box}
      className="compare relative aspect-[3/2] w-full overflow-hidden rounded-[1.5rem] bg-forest-deep"
      style={{ '--pos': `${pos}%` }}
      data-dragging={dragging}
      data-hint={hint}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={end}
      onPointerCancel={end}
      role="group"
      aria-label={alt}
    >
      <img src={after} alt="" width="1600" height="1067" draggable="false" className="absolute inset-0 size-full object-cover" />
      <img
        src={before}
        alt=""
        width="1600"
        height="1067"
        draggable="false"
        className="compare__before absolute inset-0 size-full object-cover"
      />

      <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-forest-deep/80 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
        Before
      </span>
      <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-paper/90 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-forest backdrop-blur-sm">
        After
      </span>

      <div className="compare__line pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.12)]">
        <button
          type="button"
          role="slider"
          aria-label={label}
          aria-orientation="horizontal"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={rounded}
          aria-valuetext={`${rounded}% before, ${100 - rounded}% after`}
          onKeyDown={onKeyDown}
          onFocus={() => setHint(false)}
          className="compare__thumb pointer-events-auto absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
        >
          <span className="compare__handle grid size-12 place-items-center rounded-full bg-white text-forest shadow-[0_6px_24px_rgb(0_0_0/0.28)]">
            <ChevronsLeftRight className="size-5" aria-hidden="true" />
          </span>
        </button>
      </div>
    </div>
  )
}
