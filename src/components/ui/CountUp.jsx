import { useEffect, useRef } from 'react'

const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))

/**
 * Counts from 0 up to `to` the first time it scrolls into view.
 * - The final number is in the markup, so with JavaScript off, or `prefers-reduced-motion`,
 *   nothing animates and the right value is always there.
 * - Updates the text node directly (no React re-render per frame) and stops on unmount.
 * - Mark the wrapper `aria-hidden` and give assistive tech the real value separately, so a
 *   screen reader never announces "1, 2, 3...".
 */
export default function CountUp({ to, duration = 1600, className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0
    el.textContent = '0'
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        const start = performance.now()
        const tick = (now) => {
          const t = Math.min(1, (now - start) / duration)
          el.textContent = String(Math.round(easeOutExpo(t) * to))
          if (t < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      },
      { threshold: 0.6 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      el.textContent = String(to) // Strict Mode re-run / unmount: leave the true value in place
    }
  }, [to, duration])

  return (
    <span ref={ref} className={className}>
      {to}
    </span>
  )
}
