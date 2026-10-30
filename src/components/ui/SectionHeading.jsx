import Reveal from './Reveal'

/** Eyebrow, display heading and optional lede. `tone="dark"` for forest backgrounds. */
export default function SectionHeading({ id, eyebrow, children, lede, tone = 'light', align = 'left', as: H = 'h2', className = '' }) {
  const dark = tone === 'dark'
  return (
    <Reveal className={`${align === 'center' ? 'mx-auto text-center' : ''} max-w-3xl ${className}`}>
      {eyebrow && <p className={`eyebrow eyebrow-rule ${dark ? 'text-gold' : 'text-gold-deep'}`}>{eyebrow}</p>}
      <H
        id={id}
        className={`font-display mt-4 text-[clamp(1.85rem,3.9vw,3rem)] leading-[1.12] ${dark ? 'text-white' : 'text-espresso'}`}
      >
        {children}
      </H>
      {lede && <p className={`mt-5 max-w-2xl text-lg leading-relaxed ${dark ? 'text-white/80' : 'text-ink-soft'} ${align === 'center' ? 'mx-auto' : ''}`}>{lede}</p>}
    </Reveal>
  )
}
