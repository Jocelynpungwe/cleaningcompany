import { useLayoutEffect, useRef } from 'react'

/**
 * Fades and lifts its children in the first time they scroll into view.
 * - Content is visible in the markup; the hidden state is applied by script just before first
 *   paint, so with JavaScript off, or `prefers-reduced-motion`, nothing is ever hidden.
 * - It never measures layout: every <Reveal> on a page shares ONE IntersectionObserver, which
 *   reports what is on screen. (Measuring each element with getBoundingClientRect forced a full
 *   layout per element, ~2 s of main-thread time on a throttled phone, and would also defeat
 *   `content-visibility` on the sections.) Anything already on screen simply fades in on load.
 * - `immediate` renders a plain element for content that must be there at first paint (page <h1>).
 */
let observer

const getObserver = () =>
  (observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.dataset.reveal = 'in'
        observer.unobserve(entry.target)
      }
    },
    { rootMargin: '0px 0px -8% 0px' },
  ))

export default function Reveal({ as: Tag = 'div', delay = 0, y = 28, immediate = false, className = '', children, ...rest }) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (immediate || !el || !('IntersectionObserver' in window)) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    el.dataset.reveal = 'pending'
    getObserver().observe(el)
    return () => {
      observer?.unobserve(el)
      if (el.dataset.reveal === 'pending') delete el.dataset.reveal
    }
  }, [immediate])

  return (
    <Tag ref={ref} className={className} style={{ '--reveal-delay': `${delay}ms`, '--reveal-y': `${y}px` }} {...rest}>
      {children}
    </Tag>
  )
}
