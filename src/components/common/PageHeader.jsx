import Reveal from '../ui/Reveal'

/** Top block for inner pages: owns the single <h1>. */
export default function PageHeader({ eyebrow, title, lede, children }) {
  return (
    <header className="bg-mint pb-16 pt-36 md:pb-24 md:pt-44">
      <div className="container-x">
        <Reveal immediate className="max-w-3xl">
          <p className="eyebrow text-forest">{eyebrow}</p>
          <h1 className="font-display mt-4 text-[clamp(2.2rem,5vw,3.9rem)] leading-[1.08] text-forest">{title}</h1>
          {lede && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">{lede}</p>}
          {children}
        </Reveal>
      </div>
    </header>
  )
}
