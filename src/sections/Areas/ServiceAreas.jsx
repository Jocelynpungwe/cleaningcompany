import { MapPin } from 'lucide-react'
import Reveal from '../../components/ui/Reveal'
import SectionHeading from '../../components/ui/SectionHeading'
import Button from '../../components/ui/Button'
import { serviceAreas } from '../../data/homeContent'
import { business, whatsappUrl } from '../../data/business'

/**
 * Service areas. The owner supplied one verified region ("Ottawa & surroundings") and no
 * neighbourhood list, so only that is shown. If `business.serviceAreas` is filled in later,
 * the named areas appear as chips under the text.
 */
export default function ServiceAreas() {
  return (
    <section id="areas" aria-labelledby="areas-title" className="defer bg-mint py-24 md:py-32">
      <div className="container-x grid items-center gap-14 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-24">
        <div>
          <SectionHeading id="areas-title" eyebrow={serviceAreas.eyebrow} lede={serviceAreas.text}>
            {serviceAreas.heading}
          </SectionHeading>

          {business.serviceAreas.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-2.5">
              {business.serviceAreas.map((a) => (
                <li key={a} className="rounded-full border border-forest/25 bg-paper px-4 py-2 text-sm font-medium text-forest">
                  {a}
                </li>
              ))}
            </ul>
          )}

          <Reveal delay={150} className="mt-10 flex flex-wrap gap-3">
            <Button
              href={whatsappUrl('Hello VitaGrace, do you clean at my address? ')}
              target="_blank"
              rel="noopener noreferrer"
              arrow
            >
              Check my address
            </Button>
            <Button to="/contact" variant="secondary">
              Request a quote
            </Button>
          </Reveal>
        </div>

        {/* Decorative: concentric rings around the city. No map data is implied. */}
        <Reveal delay={100} className="relative mx-auto grid aspect-square w-full max-w-md place-items-center" aria-hidden="true">
          {[100, 74, 48].map((size, i) => (
            <span
              key={size}
              className="absolute rounded-full border border-forest/20"
              style={{ width: `${size}%`, height: `${size}%`, background: i === 2 ? 'rgb(120 184 154 / 0.25)' : 'transparent' }}
            />
          ))}
          <span className="relative flex flex-col items-center gap-2 text-forest">
            <span className="grid size-14 place-items-center rounded-full bg-forest text-white shadow-[var(--shadow-soft)]">
              <MapPin className="size-6" />
            </span>
            <span className="font-display text-3xl">{business.city}</span>
            <span className="eyebrow text-ink-soft">& surroundings</span>
          </span>
        </Reveal>
      </div>
    </section>
  )
}
