import Reveal from '../../components/ui/Reveal'
import SectionHeading from '../../components/ui/SectionHeading'
import Button from '../../components/ui/Button'
import CountUp from '../../components/ui/CountUp'
import { about } from '../../data/homeContent'
import { business } from '../../data/business'
import aboutImg from '../../assets/images/about/about.webp'

export default function AboutPreview({ id = 'about', headingTag = 'h2' }) {
  return (
    <section id={id} aria-labelledby="about-title" className="defer bg-mint py-24 md:py-32">
      <div className="container-x grid items-center gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-24">
        <Reveal className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="aspect-[4/5] overflow-hidden rounded-[2rem] bg-white shadow-[var(--shadow-soft)]">
            <img
              src={aboutImg}
              alt={about.imageAlt}
              width="1000"
              height="1250"
              loading="lazy"
              decoding="async"
              className="size-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -right-2 rounded-2xl bg-forest px-7 py-6 text-white shadow-[var(--shadow-soft)] sm:-right-8">
            <p className="font-display text-5xl leading-none" aria-hidden="true">
              <CountUp to={business.yearsExperience} />
            </p>
            <p className="mt-2 text-sm text-white/80">
              <span className="sr-only">{business.yearsExperience} </span>years in {business.city}
            </p>
          </div>
        </Reveal>

        <div>
          <SectionHeading id="about-title" as={headingTag} eyebrow={about.eyebrow}>
            {about.heading}
          </SectionHeading>
          <Reveal delay={120} className="mt-8 space-y-5 text-lg leading-relaxed text-ink-soft">
            {about.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </Reveal>
          <ul className="mt-10 grid gap-6 border-t border-forest/15 pt-8 sm:grid-cols-3">
            {about.values.map((v, i) => (
              <Reveal as="li" key={v.title} delay={i * 90}>
                <h3 className="font-display text-xl text-forest">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{v.text}</p>
              </Reveal>
            ))}
          </ul>
          {about.cta && (
            <Reveal delay={200} className="mt-10">
              <Button to={about.cta.to} arrow>
                {about.cta.label}
              </Button>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  )
}
