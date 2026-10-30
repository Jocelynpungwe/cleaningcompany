import { useEffect, useRef, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Clock, Loader2, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import Reveal from '../components/ui/Reveal'
import Button from '../components/ui/Button'
import { business, mailtoUrl, whatsappUrl } from '../data/business'
import { services } from '../data/services'
import { buildMessage, frequencyOptions, quoteSchema, serviceOptions, sizeOptions, today } from '../lib/quoteForm'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

const ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT

const control =
  'tap mt-2 w-full rounded-2xl border bg-white px-4 py-3.5 text-[0.95rem] text-charcoal placeholder:text-ink-soft/70 ' +
  'transition-[border-color,box-shadow] duration-300 focus:border-espresso focus:outline-none focus:ring-2 focus:ring-espresso/30 '

function Field({ id, label, error, hint, optional, children }) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-espresso">
        {label}
        {optional && <span className="ml-1.5 font-normal text-ink-soft">(optional)</span>}
      </label>
      {children({ 'aria-invalid': error ? 'true' : undefined, 'aria-describedby': describedBy, className: `${control} ${error ? 'border-red-700' : 'border-line-strong/50'}` })}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-soft">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-red-800">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  )
}

export default function Contact() {
  useDocumentMeta({
    title: 'Get Your Free Quote',
    description: `Request a free cleaning quote in Ottawa. Message ${business.name} on WhatsApp, call, email or use the quote form.`,
  })

  const { state } = useLocation()
  const [params] = useSearchParams()
  const estimate = state?.estimate ?? null

  const fromEstimator = estimate && services.find((s) => s.estimatorKey === estimate.service)?.slug
  const fromQuery = services.find((s) => s.slug === params.get('service'))?.slug
  const [status, setStatus] = useState('idle') // idle | sending | sent | error | prepared
  const [prepared, setPrepared] = useState('')
  const [invalidTick, setInvalidTick] = useState(0)
  const summaryRef = useRef(null)
  const resultRef = useRef(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(quoteSchema),
    shouldFocusError: false,
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      service: fromQuery || fromEstimator || '',
      size: estimate?.size ?? '',
      frequency: estimate?.frequency ?? '',
      date: '',
      area: '',
      message: estimate
        ? `From the website estimator: ${estimate.serviceLabel}, ${estimate.sizeLabel.toLowerCase()} space, ${estimate.bathrooms} bathroom${estimate.bathrooms > 1 ? 's' : ''}${estimate.extras.length ? `, extras: ${estimate.extras.join(', ')}` : ''}.\n\n`
        : '',
      website: '',
    },
  })

  const errorEntries = Object.entries(errors)
  // Only a failed submit moves focus to the error summary (not every keystroke that changes the errors).
  useEffect(() => {
    if (invalidTick > 0) summaryRef.current?.focus()
  }, [invalidTick])
  useEffect(() => {
    if (status !== 'idle' && status !== 'sending') resultRef.current?.focus()
  }, [status])

  const onSubmit = async (values) => {
    if (values.website) return // honeypot tripped: drop silently
    const message = buildMessage(values, estimate)
    if (!ENDPOINT) {
      setPrepared(message)
      setStatus('prepared')
      return
    }
    setStatus('sending')
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...values, message }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setStatus('sent')
    } catch {
      setPrepared(message)
      setStatus('error')
    }
  }

  const waLink = whatsappUrl(prepared)
  const mailLink = mailtoUrl('Cleaning quote request', prepared)
  const showForm = status === 'idle' || status === 'sending'

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Let's make your space shine."
        lede="Ask for a free quote, a free consultation or a same-day appointment. The fastest way to reach us is WhatsApp."
      />

      <section aria-label="Contact details and quote form" className="bg-paper py-16 md:py-24">
        <div className="container-x grid gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-20">
          <Reveal as="aside" aria-label="Ways to reach us" className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="tap group flex items-center gap-4 rounded-3xl bg-espresso p-6 text-white transition-colors duration-300 hover:bg-espresso-deep"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-gold text-espresso-deep">
                <MessageCircle className="size-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-display text-xl">Chat on WhatsApp</span>
                <span className="block text-sm text-white/75">Usually the quickest way to book</span>
              </span>
            </a>
            <ul className="divide-y divide-line rounded-3xl border border-line bg-white">
              <li>
                <a href={business.phoneHref} className="tap flex items-center gap-4 p-5 text-charcoal hover:text-espresso">
                  <Phone className="size-5 shrink-0 text-espresso" aria-hidden="true" />
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">Phone</span>
                    {business.phone}
                  </span>
                </a>
              </li>
              <li>
                <a href={`mailto:${business.email}`} className="tap flex items-center gap-4 break-all p-5 text-charcoal hover:text-espresso">
                  <Mail className="size-5 shrink-0 text-espresso" aria-hidden="true" />
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">Email</span>
                    {business.email}
                  </span>
                </a>
              </li>
              <li className="flex items-center gap-4 p-5 text-charcoal">
                <MapPin className="size-5 shrink-0 text-espresso" aria-hidden="true" />
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">Serving</span>
                  {business.areaServed}
                </span>
              </li>
              {business.hours && (
                <li className="flex items-center gap-4 p-5 text-charcoal">
                  <Clock className="size-5 shrink-0 text-espresso" aria-hidden="true" />
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">Hours</span>
                    {business.hours}
                  </span>
                </li>
              )}
            </ul>
          </Reveal>

          <Reveal delay={100} className="rounded-[2rem] border border-line bg-white p-6 shadow-[var(--shadow-soft)] sm:p-10">
            {showForm ? (
              <form onSubmit={handleSubmit(onSubmit, () => setInvalidTick((n) => n + 1))} noValidate aria-busy={status === 'sending'}>
                <h2 className="font-display text-3xl text-espresso">Request your free quote</h2>
                <p className="mt-2 text-sm text-ink-soft">Fields marked with an asterisk are required.</p>

                {estimate?.range && (
                  <p className="mt-5 rounded-2xl bg-cream px-4 py-3 text-sm text-espresso">
                    Your estimator answers are filled in below ({estimate.range}, demonstration figures).
                  </p>
                )}

                {errorEntries.length > 0 && (
                  <div
                    ref={summaryRef}
                    tabIndex={-1}
                    role="alert"
                    className="mt-6 rounded-2xl border border-red-800/40 bg-red-50 p-5 outline-none focus-visible:ring-2 focus-visible:ring-red-800"
                  >
                    <p className="font-semibold text-red-900">Please fix {errorEntries.length === 1 ? 'one thing' : `${errorEntries.length} things`} before sending:</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-900">
                      {errorEntries.map(([name, err]) => (
                        <li key={name}>
                          <a href={`#f-${name}`} className="underline underline-offset-2" onClick={(e) => { e.preventDefault(); document.getElementById(`f-${name}`)?.focus() }}>
                            {err.message}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  <Field id="f-name" label="Full name *" error={errors.name?.message}>
                    {(p) => <input id="f-name" type="text" autoComplete="name" {...register('name')} {...p} />}
                  </Field>
                  <Field id="f-phone" label="Phone or WhatsApp *" error={errors.phone?.message}>
                    {(p) => <input id="f-phone" type="tel" inputMode="tel" autoComplete="tel" {...register('phone')} {...p} />}
                  </Field>
                  <div className="sm:col-span-2">
                    <Field id="f-email" label="Email *" error={errors.email?.message}>
                      {(p) => <input id="f-email" type="email" autoComplete="email" {...register('email')} {...p} />}
                    </Field>
                  </div>
                  <Field id="f-service" label="Service *" error={errors.service?.message}>
                    {(p) => (
                      <select id="f-service" {...register('service')} {...p}>
                        <option value="">Choose a service</option>
                        {serviceOptions.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </Field>
                  <Field id="f-date" label="Preferred date" optional error={errors.date?.message}>
                    {(p) => <input id="f-date" type="date" min={today()} {...register('date')} {...p} />}
                  </Field>
                  <Field id="f-size" label="Size of the space" optional>
                    {(p) => (
                      <select id="f-size" {...register('size')} {...p}>
                        <option value="">Not sure</option>
                        {sizeOptions.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </Field>
                  <Field id="f-frequency" label="How often?" optional>
                    {(p) => (
                      <select id="f-frequency" {...register('frequency')} {...p}>
                        <option value="">Not sure</option>
                        {frequencyOptions.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </Field>
                  <div className="sm:col-span-2">
                    <Field id="f-area" label="Neighbourhood or postal code" optional hint="So we can confirm we cover you." error={errors.area?.message}>
                      {(p) => <input id="f-area" type="text" autoComplete="postal-code" {...register('area')} {...p} />}
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field id="f-message" label="Tell us about your space *" error={errors.message?.message}>
                      {(p) => <textarea id="f-message" rows={5} {...register('message')} {...p} />}
                    </Field>
                  </div>
                </div>

                {/* Honeypot: hidden from people and assistive tech; bots tend to fill it. */}
                <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                  <label htmlFor="f-website">Leave this field empty</label>
                  <input id="f-website" type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="tap inline-flex items-center justify-center gap-2.5 rounded-full bg-espresso px-8 py-4 text-[0.95rem] font-semibold text-white transition-colors duration-300 hover:bg-espresso-deep disabled:opacity-70"
                  >
                    {status === 'sending' ? (
                      <>
                        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                        Sending…
                      </>
                    ) : ENDPOINT ? (
                      'Send My Request'
                    ) : (
                      'Prepare My Request'
                    )}
                  </button>
                  {!ENDPOINT && (
                    <p className="max-w-xs text-xs leading-relaxed text-ink-soft">
                      Next you will choose WhatsApp or email to send it. Nothing is sent from this page by itself.
                    </p>
                  )}
                </div>
              </form>
            ) : (
              <div ref={resultRef} tabIndex={-1} className="outline-none" role="status">
                {status === 'sent' && (
                  <>
                    <h2 className="font-display text-3xl text-espresso">Thank you, we have your request.</h2>
                    <p className="mt-4 text-ink-soft">We will reply with a quote for your space. For anything urgent, message us on WhatsApp.</p>
                  </>
                )}
                {status === 'error' && (
                  <>
                    <h2 className="font-display text-3xl text-red-900">We could not send that from the website.</h2>
                    <p className="mt-4 text-ink-soft">Nothing was lost. Send the same message with one tap instead:</p>
                  </>
                )}
                {status === 'prepared' && (
                  <>
                    <h2 className="font-display text-3xl text-espresso">Your request is ready to send.</h2>
                    <p className="mt-4 text-ink-soft">
                      <strong className="text-charcoal">It has not been sent yet.</strong> Choose how you would like to send it. Your details are filled in for you.
                    </p>
                  </>
                )}

                {(status === 'prepared' || status === 'error') && (
                  <>
                    <pre className="mt-6 max-h-64 overflow-auto whitespace-pre-wrap rounded-2xl bg-cream p-5 font-sans text-sm leading-relaxed text-charcoal">{prepared}</pre>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Button href={waLink} target="_blank" rel="noopener noreferrer" arrow>
                        Send on WhatsApp
                      </Button>
                      <Button href={mailLink} variant="secondary">
                        Send by email
                      </Button>
                      <Button variant="secondary" onClick={() => setStatus('idle')}>
                        Edit my details
                      </Button>
                    </div>
                  </>
                )}
                {status === 'sent' && (
                  <Button className="mt-8" variant="secondary" onClick={() => { reset(); setStatus('idle') }}>
                    Send another request
                  </Button>
                )}
              </div>
            )}
          </Reveal>
        </div>
      </section>
    </>
  )
}
