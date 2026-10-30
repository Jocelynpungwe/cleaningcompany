import Reveal from '../../components/ui/Reveal'
import SectionHeading from '../../components/ui/SectionHeading'
import Icon from '../../components/ui/Icon'
import { process } from '../../data/homeContent'

/** Four-step timeline: vertical on phones, horizontal with a connecting line from `lg`. */
export default function Process() {
  return (
    <section id="process" aria-labelledby="process-title" className="defer bg-cream py-24 md:py-32">
      <div className="container-x">
        <SectionHeading id="process-title" eyebrow={process.eyebrow} align="center">
          {process.heading}
        </SectionHeading>

        <ol className="relative mt-16 grid gap-12 lg:grid-cols-4 lg:gap-8">
          {/* connecting line (desktop) */}
          <span
            aria-hidden="true"
            className="absolute left-[12.5%] right-[12.5%] top-8 hidden h-px bg-espresso/25 lg:block"
          />
          {process.steps.map((step, i) => (
            <Reveal
              as="li"
              key={step.title}
              delay={i * 120}
              className="relative grid grid-cols-[4rem_1fr] gap-6 lg:grid-cols-1 lg:content-start lg:justify-items-center lg:gap-0 lg:text-center"
            >
              {/* vertical line (mobile) */}
              {i < process.steps.length - 1 && (
                <span aria-hidden="true" className="absolute bottom-[-3rem] left-8 top-16 w-px bg-espresso/25 lg:hidden" />
              )}
              <span className="relative z-10 grid size-16 place-items-center rounded-full border border-gold/60 bg-paper text-gold-deep shadow-[var(--shadow-soft)]">
                <Icon name={step.icon} className="size-7" />
              </span>
              <div className="lg:mt-7">
                <p className="eyebrow text-gold-deep">Step {i + 1}</p>
                <h3 className="font-display mt-2 text-2xl text-espresso">{step.title}</h3>
                <p className="mt-3 max-w-[18rem] leading-relaxed text-ink-soft lg:mx-auto">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
