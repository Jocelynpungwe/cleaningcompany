import Reveal from '../../components/ui/Reveal'
import SectionHeading from '../../components/ui/SectionHeading'
import Icon from '../../components/ui/Icon'
import CountUp from '../../components/ui/CountUp'
import { trust } from '../../data/homeContent'
import { business } from '../../data/business'

export default function Trust() {
  return (
    <section id="after-hero" tabIndex={-1} aria-labelledby="trust-title" className="defer bg-paper py-24 outline-none md:py-32">
      <div className="container-x grid gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div>
          <SectionHeading id="trust-title" eyebrow={trust.eyebrow} lede={trust.lede}>
            {trust.heading}
          </SectionHeading>
          <Reveal delay={150} className="mt-12 flex items-end gap-5 border-t border-line pt-8">
            <span className="font-display text-[6.5rem] leading-[0.8] text-fresh" aria-hidden="true">
              <CountUp to={business.yearsExperience} />
            </span>
            <p className="max-w-[14rem] pb-1 text-sm leading-snug text-ink-soft">
              <span className="sr-only">{business.yearsExperience} </span>
              years caring for homes and businesses in {business.city}.
            </p>
          </Reveal>
        </div>

        <ul className="grid gap-x-10 gap-y-12 sm:grid-cols-2">
          {trust.points.map((p, i) => (
            <Reveal as="li" key={p.title} delay={i * 90} className="border-t border-line pt-7">
              <span className="grid size-12 place-items-center rounded-full bg-mint text-forest">
                <Icon name={p.icon} />
              </span>
              <h3 className="font-display mt-6 text-2xl text-forest">{p.title}</h3>
              <p className="mt-3 leading-relaxed text-ink-soft">{p.text}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
