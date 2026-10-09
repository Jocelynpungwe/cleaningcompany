import { heroCopy as copy } from '../../data/heroCopy'
import { heroSequence } from '../../data/heroSequence'
import Button from '../../components/ui/Button'
import './hero.css'

/**
 * The composed, no-motion hero: the finished room with the final copy and CTAs.
 * Shown for prefers-reduced-motion, short landscape phones, missing/failed frames.
 * Only the matching crop is downloaded (<picture> media switch).
 */
export default function StaticHero() {
  const last = (key) => heroSequence[key].frames.at(-1)
  const desktop = last('desktop')
  const mobile = last('mobile')

  return (
    <section
      className="hero-static"
      aria-label="Hero"
      data-text-side={heroSequence.textSide}
      style={{
        '--hero-copy-w': heroSequence.copyLayout?.width,
        '--hero-h-size': heroSequence.copyLayout?.headlineSize,
        '--hero-body-w': heroSequence.copyLayout?.bodyWidth,
      }}
    >
      {desktop || mobile ? (
        <picture>
          {mobile && <source media="(max-width: 767px), (orientation: portrait)" srcSet={mobile} />}
          <img src={desktop || mobile} alt={copy.alt} fetchPriority="high" decoding="async" />
        </picture>
      ) : null}

      <div className="hero-band hero-band-3">
        <div className="hero-text">
          <h1 className="hero-h">{copy.act3.headline}</h1>
          <p className="hero-body">{copy.act3.body}</p>
        </div>
        <div className="hero-cta">
          <Button to={copy.act3.primary.to} arrow>
            {copy.act3.primary.label}
          </Button>
          <Button to={copy.act3.secondary.to} variant="secondaryOnPhoto">
            {copy.act3.secondary.label}
          </Button>
        </div>
      </div>

      {heroSequence.isPlaceholder && (
        <p className="hero-badge" role="note">
          <b>Prototype</b> · {heroSequence.placeholderNote}
        </p>
      )}
    </section>
  )
}
