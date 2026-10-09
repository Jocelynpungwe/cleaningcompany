import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register once, import `gsap` / `ScrollTrigger` from here everywhere.
gsap.registerPlugin(ScrollTrigger)

// Mobile browsers fire resize as the URL bar collapses; refreshing the pin on
// every one of those makes a pinned hero jump.
ScrollTrigger.config({ ignoreMobileResize: true })

// Dev-only handle for the QA scripts in scripts/qa (counts live triggers, etc.).
// Stripped from production builds.
if (import.meta.env.DEV) window.__gsapDebug = { gsap, ScrollTrigger }

export { gsap, ScrollTrigger }
