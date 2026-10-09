import Reveal from '../../components/ui/Reveal'
import SectionHeading from '../../components/ui/SectionHeading'
import Icon from '../../components/ui/Icon'
import { whyChoose } from '../../data/homeContent'

export default function WhyChoose() {
  const { eco } = whyChoose
  return (
    <section id="why-us" aria-labelledby="why-title" className="defer bg-paper py-24 md:py-32">
      <div className="container-x">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-24">
          <SectionHeading id="why-title" eyebrow={whyChoose.eyebrow} className="lg:sticky lg:top-32 lg:self-start">
            {whyChoose.heading}
          </SectionHeading>

          <ul>
            {whyChoose.items.map((item, i) => (
              <Reveal
                as="li"
                key={item.title}
                delay={i * 70}
                className="grid grid-cols-[3.25rem_1fr] gap-5 border-t border-line py-8 first:border-t-0 first:pt-0 sm:grid-cols-[3.25rem_minmax(0,1fr)_minmax(0,1fr)] sm:items-center sm:gap-8"
              >
                <span className="grid size-[3.25rem] place-items-center rounded-full bg-mint text-forest">
                  <Icon name={item.icon} className="size-6" />
                </span>
                <div className="sm:contents">
                  <h3 className="font-display text-2xl text-forest sm:text-[1.7rem]">{item.title}</h3>
                  <p className="mt-2 leading-relaxed text-ink-soft sm:mt-0">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>

        {/* Eco-friendly band: the owner's own selling point, in the owner's words. */}
        <Reveal className="on-dark relative mt-24 overflow-hidden rounded-[2rem] bg-forest px-7 py-14 text-white md:px-16 md:py-20">
          <Icon
            name="Leaf"
            strokeWidth={0.6}
            className="pointer-events-none absolute -right-10 -top-10 size-[22rem] rotate-12 text-fresh/15"
          />
          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-center">
            <div>
              <p className="eyebrow text-fresh">{eco.eyebrow}</p>
              <h3 className="font-display mt-4 text-[clamp(1.55rem,2.8vw,2.3rem)] leading-[1.2]">{eco.heading}</h3>
            </div>
            <ul className="space-y-3.5">
              {eco.points.map((p) => (
                <li key={p} className="flex items-start gap-3.5 text-lg text-white/90">
                  <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-fresh text-forest-deep">
                    <Icon name="Check" className="size-3.5" strokeWidth={2.5} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
