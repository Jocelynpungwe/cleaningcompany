import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import Reveal from '../../components/ui/Reveal'
import SectionHeading from '../../components/ui/SectionHeading'
import Button from '../../components/ui/Button'
import { services } from '../../data/services'

/** Large photo cards, one per real service. A wrapped, centred flex row keeps an odd count balanced. */
export default function ServicesShowcase() {
  return (
    <section id="services" aria-labelledby="services-title" className="defer bg-paper py-24 md:py-32">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading id="services-title" eyebrow="Our services" lede="Professional cleaning for homes and businesses in Ottawa, tailored to your lifestyle and budget.">
            Every space, cared for.
          </SectionHeading>
          <Reveal delay={150}>
            <Button to="/services" variant="secondary" arrow>
              All services
            </Button>
          </Reveal>
        </div>

        <ul className="mt-14 flex flex-wrap justify-center gap-5 md:gap-6">
          {services.map((s, i) => (
            <Reveal
              as="li"
              key={s.slug}
              delay={(i % 3) * 100}
              className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
            >
              <Link
                to={`/services#${s.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-forest-deep"
              >
                <img
                  src={s.image}
                  alt=""
                  width="960"
                  height="1200"
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover transition-transform duration-[1200ms] ease-[var(--ease-premium)] group-hover:scale-[1.05]"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-forest-deep via-forest-deep/70 via-35% to-transparent to-65%"
                />
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 md:p-7">
                  <span className="block">
                    <span className="font-display block text-[1.7rem] leading-tight text-white">{s.name}</span>
                    <span className="mt-2 block max-w-[22rem] text-[0.95rem] leading-snug text-white/85">
                      {s.short}
                    </span>
                  </span>
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-fresh text-forest-deep transition-transform duration-500 ease-[var(--ease-premium)] group-hover:rotate-45">
                    <ArrowUpRight className="size-5" aria-hidden="true" />
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
