import { Link } from 'react-router-dom'
import { business } from '../../data/business'

export function LogoMark({ className = 'size-9' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#123D32" />
      <path
        d="M32 11c1.6 11.2 5.4 15.4 17 17-11.6 1.6-15.4 5.8-17 17-1.6-11.2-5.4-15.4-17-17 11.6-1.6 15.4-5.8 17-17Z"
        fill="#78B89A"
      />
      <circle cx="47" cy="47" r="4.5" fill="#EAF5EF" />
    </svg>
  )
}

/** Text logo: "VitaGrace" over "Cleaning Services", as on the owner's current site. */
export default function Logo({ className = '', tone = 'dark' }) {
  const light = tone !== 'dark'
  return (
    <Link to="/" className={`tap inline-flex items-center gap-3 ${className}`}>
      <LogoMark />
      <span className="flex flex-col">
        <span className={`font-display text-[1.45rem] leading-none ${light ? 'text-white' : 'text-forest'}`}>
          {business.name}
        </span>
        <span
          className={`eyebrow mt-1 !text-[0.62rem] !tracking-[0.2em] ${light ? 'text-fresh' : 'text-ink-soft'}`}
        >
          {business.descriptor}
        </span>
      </span>
      <span className="sr-only">, home page</span>
    </Link>
  )
}
