import { Link } from 'react-router-dom'
import { business } from '../../data/business'

export function LogoMark({ className = 'size-9' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#2B2115" />
      <path
        d="M32 11c1.6 11.2 5.4 15.4 17 17-11.6 1.6-15.4 5.8-17 17-1.6-11.2-5.4-15.4-17-17 11.6-1.6 15.4-5.8 17-17Z"
        fill="#D4AF5F"
      />
      <circle cx="47" cy="47" r="4.5" fill="#F7F0DE" />
    </svg>
  )
}

/** Text logo: the business name over its descriptor (see src/data/business.js). */
export default function Logo({ className = '', tone = 'dark' }) {
  const light = tone !== 'dark'
  return (
    <Link to="/" className={`tap inline-flex items-center gap-3 ${className}`}>
      <LogoMark />
      <span className="flex flex-col">
        <span className={`font-display text-[1.45rem] leading-none ${light ? 'text-white' : 'text-espresso'}`}>
          {business.name}
        </span>
        <span
          className={`eyebrow mt-1 !text-[0.62rem] !tracking-[0.2em] ${light ? 'text-gold' : 'text-ink-soft'}`}
        >
          {business.descriptor}
        </span>
      </span>
      <span className="sr-only">, home page</span>
    </Link>
  )
}
