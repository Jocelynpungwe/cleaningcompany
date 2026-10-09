import Reveal from '../../components/ui/Reveal'
import Button from '../../components/ui/Button'
import { finalCta } from '../../data/homeContent'
import { whatsappUrl } from '../../data/business'
import ctaImg from '../../assets/images/cta/final-cta.webp'

export default function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="defer on-dark relative isolate overflow-hidden bg-forest-deep py-28 text-white md:py-40">
      <img
        src={ctaImg}
        alt={finalCta.imageAlt}
        width="2000"
        height="1125"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 -z-20 size-full object-cover"
      />
      {/* Solid forest wash on the text side keeps white type above 7:1 over the bright photo. */}
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-forest-deep via-forest-deep/85 via-45% to-forest-deep/20 max-md:bg-forest-deep/80"
      />
      <div className="container-x">
        <Reveal className="max-w-2xl">
          <h2 id="cta-title" className="font-display text-[clamp(2.1rem,5vw,3.8rem)] leading-[1.1]">
            {finalCta.heading}
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">{finalCta.text}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button to={finalCta.cta.to} variant="onDark" arrow>
              {finalCta.cta.label}
            </Button>
            <Button href={whatsappUrl()} variant="ghostOnDark" target="_blank" rel="noopener noreferrer">
              Chat on WhatsApp
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
