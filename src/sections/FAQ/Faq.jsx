import { useState } from 'react'
import { Plus } from 'lucide-react'
import Reveal from '../../components/ui/Reveal'
import SectionHeading from '../../components/ui/SectionHeading'
import { faqs } from '../../data/homeContent'

/**
 * Accordion built from real buttons: aria-expanded / aria-controls, panels as labelled regions,
 * several can be open at once, and the height animation uses the grid-rows trick (no JS measuring).
 */
export default function Faq() {
  const [open, setOpen] = useState(() => new Set())
  const toggle = (i) =>
    setOpen((cur) => {
      const next = new Set(cur)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })

  return (
    <section id="faq" aria-labelledby="faq-title" className="defer bg-paper py-24 md:py-32">
      <div className="container-x grid gap-14 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-24">
        <SectionHeading id="faq-title" eyebrow="Questions" lede="Cannot find what you need? Message us and we will answer." className="lg:sticky lg:top-32 lg:self-start">
          Good to know.
        </SectionHeading>

        <Reveal as="ul" className="border-b border-line">
          {faqs.map((f, i) => {
            const isOpen = open.has(i)
            return (
              <li key={f.q} className="border-t border-line">
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => toggle(i)}
                    className="tap group flex w-full items-center justify-between gap-6 py-6 text-left"
                  >
                    <span className="font-display text-xl text-espresso sm:text-2xl">{f.q}</span>
                    <span
                      aria-hidden="true"
                      className={`grid size-10 shrink-0 place-items-center rounded-full border border-line-strong/60 text-espresso transition-[transform,background-color] duration-500 ease-[var(--ease-premium)] group-hover:bg-cream ${isOpen ? 'rotate-45 bg-cream' : ''}`}
                    >
                      <Plus className="size-4" />
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-a-${i}`}
                  inert={!isOpen}
                  className={`grid transition-[grid-template-rows] duration-500 ease-[var(--ease-premium)] ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-2xl pb-7 leading-relaxed text-ink-soft">{f.a}</p>
                  </div>
                </div>
              </li>
            )
          })}
        </Reveal>
      </div>
    </section>
  )
}
