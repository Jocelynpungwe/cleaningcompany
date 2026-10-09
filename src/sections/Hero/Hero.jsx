import { useState } from 'react'
import { useMediaQuery, usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import { heroSequence } from '../../data/heroSequence'
import ScrollHero from './ScrollHero'
import StaticHero from './StaticHero'

/**
 * Chooses the hero experience, live (rotation, resize and the OS reduced-motion
 * setting all re-evaluate without a reload):
 *
 *   reduced motion / short landscape phone / frames failed  ->  StaticHero
 *   portrait or narrow viewport                             ->  ScrollHero (mobile crop, fewer, smaller frames)
 *   everything else                                         ->  ScrollHero (16:9 desktop sequence)
 */
export default function Hero() {
  const reduceMotion = usePrefersReducedMotion()
  const shortLandscape = useMediaQuery('(orientation: landscape) and (pointer: coarse) and (max-height: 560px)')
  const portrait = useMediaQuery('(max-width: 767px), (orientation: portrait)')
  const [failed, setFailed] = useState(false)

  const variant = portrait ? 'mobile' : 'desktop'
  const hasFrames = heroSequence[variant].frames.length > 0

  if (reduceMotion || shortLandscape || failed || !hasFrames) return <StaticHero />
  return <ScrollHero key={variant} variant={variant} onFail={() => setFailed(true)} />
}
