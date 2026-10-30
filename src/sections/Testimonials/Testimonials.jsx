import { Quote, Star } from 'lucide-react'
import Reveal from '../../components/ui/Reveal'
import SectionHeading from '../../components/ui/SectionHeading'
import Button from '../../components/ui/Button'
import { testimonials, testimonialsMeta } from '../../data/testimonials'
import { business, whatsappUrl } from '../../data/business'

/**
 * Testimonials come from src/data/testimonials.js and nowhere else. In this demo they are sample
 * reviews, and the section says so on screen while `testimonialsMeta.isDemo` is true. With an empty
 * list it falls back to an invitation to share a review instead of showing quotes.
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
          lede={hasReviews ? 'Homes and workplaces across Ottawa, in their own words.' : `Every review here will be from a real ${business.name} customer, in their own words.`}
        >
          {hasReviews ? 'What our customers say.' : 'Reviews, in your words.'}
        </SectionHeading>

        {hasReviews ? (
          <>
            <ul className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t, i) => (
                <Reveal
                  as="li"
                  key={t.name + i}
                  delay={(i % 3) * 90}
                  className="relative flex flex-col overflow-hidden rounded-[1.75rem] border border-line bg-white p-8 shadow-[var(--shadow-soft)]"
                >
                  <Quote
                    aria-hidden="true"
                    strokeWidth={1}
                    className="pointer-events-none absolute -right-3 -top-3 size-24 rotate-180 text-cream"
                  />
                  {t.rating && (
                    <p className="relative flex gap-1 text-gold" role="img" aria-label={`${t.rating} out of 5 stars`}>
                      {Array.from({ length: 5 }, (_, k) => (
                        <Star key={k} className={`size-4 ${k < t.rating ? 'fill-current' : 'text-line-strong/40'}`} aria-hidden="true" />
                      ))}
                    </p>
                  )}
                  <blockquote className="relative mt-5 flex-1 text-[1.02rem] leading-relaxed text-charcoal">{t.quote}</blockquote>
                  <div className="relative mt-7 flex items-center gap-3.5 border-t border-line pt-5">
                    <span
                      aria-hidden="true"
                      className="grid size-11 shrink-0 place-items-center rounded-full bg-espresso font-display text-lg text-white"
                    >
                      {t.name.charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-charcoal">{t.name}</p>
                      {t.detail && <p className="text-sm text-ink-soft">{t.detail}</p>}
                    </div>
                  </div>
                </Reveal>
              ))}
            </ul>
            {testimonialsMeta.isDemo && (
              <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-relaxed text-ink-soft">
                <strong className="font-semibold text-charcoal">Sample reviews.</strong> {testimonialsMeta.note}
              </p>
            )}
          </>
        ) : (
          <Reveal delay={100} className="relative mx-auto mt-14 max-w-4xl overflow-hidden rounded-[2rem] bg-cream px-7 py-14 text-center md:px-16 md:py-20">
            <Quote
              aria-hidden="true"
              strokeWidth={0.8}
              className="pointer-events-none absolute -left-10 -top-10 size-40 rotate-180 text-gold/25"
            />
            <div className="relative">
              <p className="mx-auto flex w-fit gap-1 text-gold" aria-hidden="true">
                {Array.from({ length: 5 }, (_, k) => (
                  <Star key={k} className="size-5" strokeWidth={1.5} />
                ))}
              </p>
              <h3 className="font-display mx-auto mt-6 max-w-2xl text-[clamp(1.5rem,2.8vw,2.2rem)] leading-[1.2] text-espresso">
                Had a {business.name} clean? We would love to hear how it went.
              </h3>
              <p className="mx-auto mt-5 max-w-xl leading-relaxed text-ink-soft">
                Send us a line and, with your permission, we will share it here. We only ever publish reviews written by real customers.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Button
                  href={whatsappUrl(`Hello ${business.name}, I'd like to share a review of my cleaning: `)}
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
