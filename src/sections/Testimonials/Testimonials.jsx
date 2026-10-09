import { Quote, Star } from 'lucide-react'
import Reveal from '../../components/ui/Reveal'
import SectionHeading from '../../components/ui/SectionHeading'
import Button from '../../components/ui/Button'
import { testimonials } from '../../data/testimonials'
import { whatsappUrl } from '../../data/business'

/**
 * Real testimonials come from src/data/testimonials.js and nowhere else. None have been
 * supplied yet, so the section shows an invitation to leave one instead of invented quotes.
 * The moment the array has entries, the grid below renders them and the invitation goes away.
 */
export default function Testimonials() {
  const hasReviews = testimonials.length > 0

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="defer bg-paper py-24 md:py-32">
      <div className="container-x">
        <SectionHeading
          id="reviews-title"
          eyebrow="Kind words"
          align="center"
          lede={hasReviews ? undefined : 'Every review here will be from a real VitaGrace customer, in their own words.'}
        >
          {hasReviews ? 'What our customers say.' : 'Reviews, in your words.'}
        </SectionHeading>

        {hasReviews ? (
          <ul className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal
                as="li"
                key={t.name + i}
                delay={i * 90}
                className="flex flex-col rounded-[1.75rem] border border-line bg-white p-8 shadow-[var(--shadow-soft)]"
              >
                {t.rating && (
                  <p className="flex gap-1 text-fresh" role="img" aria-label={`${t.rating} out of 5 stars`}>
                    {Array.from({ length: t.rating }, (_, k) => (
                      <Star key={k} className="size-4 fill-current" aria-hidden="true" />
                    ))}
                  </p>
                )}
                <blockquote className="font-display mt-5 flex-1 text-xl leading-snug text-forest">{t.quote}</blockquote>
                <p className="mt-6 text-sm font-semibold text-charcoal">{t.name}</p>
                {t.detail && <p className="text-sm text-ink-soft">{t.detail}</p>}
              </Reveal>
            ))}
          </ul>
        ) : (
          <Reveal delay={100} className="relative mx-auto mt-14 max-w-4xl overflow-hidden rounded-[2rem] bg-mint px-7 py-14 text-center md:px-16 md:py-20">
            <Quote
              aria-hidden="true"
              strokeWidth={0.8}
              className="pointer-events-none absolute -left-10 -top-10 size-40 rotate-180 text-fresh/25"
            />
            <div className="relative">
              <p className="mx-auto flex w-fit gap-1 text-fresh" aria-hidden="true">
                {Array.from({ length: 5 }, (_, k) => (
                  <Star key={k} className="size-5" strokeWidth={1.5} />
                ))}
              </p>
              <h3 className="font-display mx-auto mt-6 max-w-2xl text-[clamp(1.5rem,2.8vw,2.2rem)] leading-[1.2] text-forest">
                Had a VitaGrace clean? We would love to hear how it went.
              </h3>
              <p className="mx-auto mt-5 max-w-xl leading-relaxed text-ink-soft">
                Send us a line and, with your permission, we will share it here. We only ever publish reviews written by real customers.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Button
                  href={whatsappUrl("Hello VitaGrace, I'd like to share a review of my cleaning: ")}
                  target="_blank"
                  rel="noopener noreferrer"
                  arrow
                >
                  Share your experience
                </Button>
                <Button to="/contact" variant="secondary">
                  Request a quote
                </Button>
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  )
}
