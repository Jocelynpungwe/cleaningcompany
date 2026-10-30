import { useState } from 'react'
import Compare from '../../components/ui/Compare'
import Reveal from '../../components/ui/Reveal'
import SectionHeading from '../../components/ui/SectionHeading'
import Button from '../../components/ui/Button'
import { galleryPairs, galleryMeta } from '../../data/gallery'

/**
 * Before/after gallery with one comparison slider and room tabs.
 * `showLink` adds the "see more" link on the homepage; the Gallery page omits it.
 */
export default function BeforeAfter({ showLink = true, headingTag = 'h2' }) {
  const [index, setIndex] = useState(0)
  const pair = galleryPairs[index]

  return (
    <section id="gallery" aria-labelledby="gallery-title" className="defer on-dark glow-gold bg-espresso-deep py-24 md:py-32">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            id="gallery-title"
            as={headingTag}
            tone="dark"
            eyebrow="Before and after"
            lede="Drag the handle, or focus it and use the arrow keys, to see the difference a proper clean makes."
          >
            See the difference.
          </SectionHeading>
          {showLink && (
            <Reveal delay={150}>
              <Button to="/gallery" variant="ghostOnDark" arrow>
                Open the gallery
              </Button>
            </Reveal>
          )}
        </div>

        <Reveal className="mx-auto mt-12 max-w-5xl" delay={100}>
          <div role="group" aria-label="Choose a room" className="mb-6 flex flex-wrap gap-2">
            {galleryPairs.map((p, i) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={i === index}
                onClick={() => setIndex(i)}
                className={`tap rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors duration-300 ${
                  i === index
                    ? 'border-gold bg-gold text-espresso-deep'
                    : 'border-white/30 text-white hover:border-white hover:bg-white/10'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <Compare key={pair.id} before={pair.before} after={pair.after} alt={pair.alt} label={`${pair.label}: before and after comparison`} />

          {galleryMeta.isDemo && (
            <p className="mt-5 max-w-3xl text-sm leading-relaxed text-white/75">
              <strong className="font-semibold text-white">Demonstration images.</strong> {galleryMeta.note}
            </p>
          )}
        </Reveal>
      </div>
    </section>
  )
}
