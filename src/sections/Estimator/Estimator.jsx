import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Minus, Plus } from 'lucide-react'
import Reveal from '../../components/ui/Reveal'
import SectionHeading from '../../components/ui/SectionHeading'
import Button from '../../components/ui/Button'
import { pricing, estimate } from '../../data/pricing'
import { whatsappUrl } from '../../data/business'

const money = (n) =>
  new Intl.NumberFormat('en-CA', { style: 'currency', currency: pricing.currency, maximumFractionDigits: 0 }).format(n)

const optionBase =
  'tap cursor-pointer rounded-2xl border px-4 py-3 text-left transition-[border-color,background-color,box-shadow] duration-300 ' +
  'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-forest '

/** Radio/checkbox card: the native input stays in the DOM (visually hidden) for keyboards and screen readers. */
function Choice({ type = 'radio', name, value, checked, onChange, children, hint }) {
  return (
    <label
      className={`${optionBase} ${checked ? 'border-forest bg-mint shadow-[inset_0_0_0_1px_var(--color-forest)]' : 'border-line-strong/50 bg-white hover:border-forest'}`}
    >
      <input type={type} name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
      <span className="block text-[0.95rem] font-semibold text-forest">{children}</span>
      {hint && <span className="mt-0.5 block text-xs text-ink-soft">{hint}</span>}
    </label>
  )
}

/**
 * Quote estimator. Rates come from src/data/pricing.js and are DEMONSTRATION values until the
 * owner supplies real ones; the result says so. "Request My Quote" hands the answers to the
 * contact form through router state (nothing is stored or sent from here).
 */
export default function Estimator() {
  const navigate = useNavigate()
  const [service, setService] = useState('residential')
  const [size, setSize] = useState('medium')
  const [bathrooms, setBathrooms] = useState(1)
  const [frequency, setFrequency] = useState('once')
  const [extras, setExtras] = useState([])

  const result = useMemo(() => estimate({ service, size, bathrooms, frequency, extras }), [service, size, bathrooms, frequency, extras])
  const toggleExtra = (id) => setExtras((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))

  const summary = {
    service,
    serviceLabel: pricing.services[service].label,
    size,
    sizeLabel: pricing.sizes.find((s) => s.id === size).label,
    bathrooms,
    frequency,
    frequencyLabel: pricing.frequencies.find((f) => f.id === frequency).label,
    extras: pricing.extras.filter((e) => extras.includes(e.id)).map((e) => e.label),
    range: result ? `${money(result.low)} to ${money(result.high)}` : null,
  }
  const waText = `Hello VitaGrace, I'd like a quote. ${summary.serviceLabel}, ${summary.sizeLabel.toLowerCase()} space, ${bathrooms} bathroom${bathrooms > 1 ? 's' : ''}, ${summary.frequencyLabel.toLowerCase()}${summary.extras.length ? `, extras: ${summary.extras.join(', ')}` : ''}.`

  return (
    <section id="estimate" aria-labelledby="estimate-title" className="defer bg-paper py-24 md:py-32">
      <div className="container-x">
        <SectionHeading
          id="estimate-title"
          eyebrow="Quote estimator"
          lede="Answer a few questions for a rough idea of cost. It takes under a minute and nothing is sent until you choose to."
        >
          Get an estimate in a minute.
        </SectionHeading>

        <Reveal className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="space-y-9 rounded-[2rem] border border-line bg-white p-6 shadow-[var(--shadow-soft)] sm:p-9"
            aria-label="Estimator questions"
          >
            <div>
              <label htmlFor="est-service" className="block text-sm font-semibold text-forest">
                Which service?
              </label>
              <select
                id="est-service"
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="tap mt-3 w-full rounded-2xl border border-line-strong/50 bg-white px-4 py-3.5 text-[0.95rem] text-charcoal"
              >
                {Object.entries(pricing.services).map(([key, s]) => (
                  <option key={key} value={key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <fieldset>
              <legend className="text-sm font-semibold text-forest">How big is the space?</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {pricing.sizes.map((s) => (
                  <Choice key={s.id} name="est-size" value={s.id} checked={size === s.id} onChange={() => setSize(s.id)} hint={s.hint}>
                    {s.label}
                  </Choice>
                ))}
              </div>
            </fieldset>

            <div>
              <p id="est-bath-label" className="text-sm font-semibold text-forest">
                How many bathrooms?
              </p>
              <div className="mt-3 inline-flex items-center gap-1 rounded-full border border-line-strong/50 p-1" role="group" aria-labelledby="est-bath-label">
                <button
                  type="button"
                  className="tap grid size-11 place-items-center rounded-full text-forest hover:bg-mint disabled:opacity-40"
                  onClick={() => setBathrooms((n) => Math.max(1, n - 1))}
                  disabled={bathrooms <= 1}
                  aria-label="One fewer bathroom"
                >
                  <Minus className="size-4" aria-hidden="true" />
                </button>
                <output className="w-10 text-center text-lg font-semibold text-forest" aria-live="polite">
                  {bathrooms}
                </output>
                <button
                  type="button"
                  className="tap grid size-11 place-items-center rounded-full text-forest hover:bg-mint disabled:opacity-40"
                  onClick={() => setBathrooms((n) => Math.min(pricing.maxBathrooms, n + 1))}
                  disabled={bathrooms >= pricing.maxBathrooms}
                  aria-label="One more bathroom"
                >
                  <Plus className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <fieldset>
              <legend className="text-sm font-semibold text-forest">How often?</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {pricing.frequencies.map((f) => (
                  <Choice key={f.id} name="est-frequency" value={f.id} checked={frequency === f.id} onChange={() => setFrequency(f.id)}>
                    {f.label}
                  </Choice>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold text-forest">Any extras?</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {pricing.extras.map((x) => (
                  <Choice key={x.id} type="checkbox" name="est-extras" value={x.id} checked={extras.includes(x.id)} onChange={() => toggleExtra(x.id)}>
                    {x.label}
                  </Choice>
                ))}
              </div>
            </fieldset>
          </form>

          {/* Result panel */}
          <aside
            aria-labelledby="est-result-title"
            className="on-dark relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-forest p-8 text-white sm:p-10 lg:sticky lg:top-28 lg:self-start"
          >
            <div>
              <p id="est-result-title" className="eyebrow text-fresh">
                Your estimate
              </p>
              <p className="font-display mt-5 text-[clamp(2rem,4.2vw,3rem)] leading-none" aria-live="polite" aria-atomic="true">
                {result ? (
                  <>
                    {money(result.low)}
                    <span className="mx-2 text-white/50">to</span>
                    {money(result.high)}
                  </>
                ) : (
                  'Choose a service'
                )}
              </p>
              <p className="mt-2 text-sm text-white/75">per visit, {pricing.currency}, before tax</p>

              {pricing.isDemo && (
                <p className="mt-6 rounded-xl bg-white/10 px-4 py-3 text-sm leading-relaxed text-white/90">
                  <strong className="font-semibold text-white">Demonstration estimate.</strong> These figures show how the tool works and are not VitaGrace's rates. Your real quote may differ.
                </p>
              )}

              <dl className="mt-7 space-y-2.5 border-t border-white/15 pt-6 text-sm">
                {[
                  ['Service', summary.serviceLabel],
                  ['Size', summary.sizeLabel],
                  ['Bathrooms', bathrooms],
                  ['Frequency', summary.frequencyLabel],
                  ['Extras', summary.extras.length ? summary.extras.join(', ') : 'None'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-6">
                    <dt className="text-white/65">{k}</dt>
                    <dd className="text-right font-medium text-white">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-9 flex flex-col gap-3">
              <Button variant="onDark" arrow onClick={() => navigate('/contact', { state: { estimate: summary } })}>
                Request My Quote
              </Button>
              <Button variant="ghostOnDark" href={whatsappUrl(waText)} target="_blank" rel="noopener noreferrer">
                Send this on WhatsApp
              </Button>
            </div>
          </aside>
        </Reveal>
      </div>
    </section>
  )
}
