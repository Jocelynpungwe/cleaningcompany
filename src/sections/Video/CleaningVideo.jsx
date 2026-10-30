import { useRef, useState } from 'react'
import { Check, Play } from 'lucide-react'
import Reveal from '../../components/ui/Reveal'
import SectionHeading from '../../components/ui/SectionHeading'
import Button from '../../components/ui/Button'
import { video } from '../../data/homeContent'
import { business } from '../../data/business'

/**
 * "See us at work": a short silent clip of a home being cleaned.
 * - Nothing downloads until the visitor presses play (preload="none", poster image shown),
 *   so the section costs one small image on load.
 * - Never autoplays; native controls appear after the first press so it can be paused, scrubbed
 *   or taken full screen. The clip has no audio track.
 * - A text description is attached for assistive technology.
 */
export default function CleaningVideo() {
  const ref = useRef(null)
  const [started, setStarted] = useState(false)

  const start = () => {
    const el = ref.current
    if (!el) return
    setStarted(true)
    el.play().catch(() => {
      /* if the browser refuses, the native controls are now visible so the visitor can press play */
    })
  }

  return (
    <section id="video" aria-labelledby="video-title" className="defer bg-paper py-24 md:py-32">
      <div className="container-x grid items-center gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div>
          <SectionHeading id="video-title" eyebrow={video.eyebrow} lede={video.lede}>
            {video.heading}
          </SectionHeading>
          <Reveal delay={120}>
            <ul className="mt-8 space-y-4">
              {video.points.map((p) => (
                <li key={p} className="flex items-start gap-3.5 text-charcoal">
                  <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-cream text-gold-deep ring-1 ring-gold/40">
                    <Check className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
            <Button to={video.cta.to} className="mt-9" arrow>
              {video.cta.label}
            </Button>
          </Reveal>
        </div>

        <Reveal delay={100}>
          <figure>
            <div className="relative">
              {/* offset gold frame */}
              <span
                aria-hidden="true"
                className="absolute inset-0 translate-x-3 translate-y-3 rounded-[1.9rem] border border-gold/70 sm:translate-x-4 sm:translate-y-4"
              />
              <div className="relative aspect-video overflow-hidden rounded-[1.75rem] bg-espresso-deep shadow-[var(--shadow-soft)]">
                <video
                  ref={ref}
                  className="size-full object-cover"
                  poster={video.poster}
                  preload="none"
                  playsInline
                  muted
                  loop
                  controls={started}
                  aria-describedby="video-desc"
                  onEnded={() => ref.current?.pause()}
                >
                  <source src={video.src} type="video/mp4" />
                  Your browser cannot play this video.
                </video>

                {!started && (
                  <button
                    type="button"
                    onClick={start}
                    aria-label={`Play video: a home being cleaned (${business.name})`}
                    className="group absolute inset-0 grid place-items-center bg-espresso-deep/15 transition-colors duration-500 hover:bg-espresso-deep/30"
                  >
                    <span className="btn-gold grid size-20 place-items-center rounded-full transition-transform duration-500 ease-[var(--ease-premium)] group-hover:scale-110 sm:size-24">
                      <Play className="ml-1 size-8 fill-current sm:size-9" aria-hidden="true" />
                    </span>
                  </button>
                )}
              </div>
            </div>
            <p id="video-desc" className="sr-only">
              {video.description}
            </p>
            {business.isDemo && <figcaption className="mt-7 text-sm text-ink-soft">{video.demoNote}</figcaption>}
          </figure>
        </Reveal>
      </div>
    </section>
  )
}
