import { Check } from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import Reveal from '../components/ui/Reveal'
import Button from '../components/ui/Button'
import FinalCta from '../sections/CTA/FinalCta'
import { services } from '../data/services'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

export default function Services() {
  useDocumentMeta({
    title: 'Cleaning Services in Ottawa',
    description:
      'Residential, move-in/move-out, post-construction, office and commercial, and Airbnb cleaning in Ottawa. Eco-friendly products, flexible scheduling, free quotes.',
  })

  return (
    <>
      <PageHeader
        eyebrow="Our services"
        title="Cleaning for every kind of space."
        lede="Professional cleaning for homes and businesses in Ottawa, tailored to your lifestyle and budget. Eco-friendly supplies are used throughout."
      />

      <div className="bg-paper py-8 md:py-16">
        {services.map((s, i) => (
          <section
            key={s.slug}
            id={s.slug}
            tabIndex={-1}
            aria-labelledby={`${s.slug}-title`}
            className="container-x grid scroll-mt-24 items-center gap-10 py-14 outline-none md:py-20 lg:grid-cols-2 lg:gap-24"
          >
            <Reveal className={i % 2 ? 'lg:order-2' : ''}>
              <div className="aspect-[4/5] max-h-[40rem] overflow-hidden rounded-[2rem] bg-cream shadow-[var(--shadow-soft)] sm:aspect-[5/4] lg:aspect-[4/5]">
                <img
                  src={s.image}
                  alt={s.alt}
                  width="960"
                  height="1200"
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="size-full object-cover"
                />
              </div>
            </Reveal>
            <Reveal delay={100}>
              <p className="eyebrow text-gold-deep">0{i + 1}</p>
              <h2 id={`${s.slug}-title`} className="font-display mt-3 text-[clamp(1.75rem,3.3vw,2.6rem)] leading-[1.12] text-espresso">
                {s.name}
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-ink-soft">{s.long}</p>
              <ul className="mt-7 space-y-3.5">
                {s.includes.map((item) => (
                  <li key={item} className="flex items-start gap-3.5 text-charcoal">
                    <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-cream text-gold-deep ring-1 ring-gold/40">
                      <Check className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Button to={`/contact?service=${s.slug}`} className="mt-9" arrow>
                Request this service
              </Button>
            </Reveal>
          </section>
        ))}
      </div>

      <FinalCta />
    </>
  )
}
