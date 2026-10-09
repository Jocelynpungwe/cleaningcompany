import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { ScrollTrigger } from '../animations/gsap'

/**
 * Route-change scrolling: to top on a new page, to the target for #anchors.
 * Smooth only when the user has not asked for reduced motion. (CSS
 * scroll-behavior is deliberately not used, see styles/index.css.)
 */
export function useHashScroll() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const behavior = reduce ? 'auto' : 'smooth'
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      return
    }
    // wait a frame so lazy routes and pin-spacers have laid out
    const id = requestAnimationFrame(() => {
      ScrollTrigger.refresh()
      const el = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 72
        window.scrollTo({ top, behavior })
        el.focus?.({ preventScroll: true })
      }
    })
    return () => cancelAnimationFrame(id)
  }, [pathname, hash])
}
