import PageHeader from '../components/common/PageHeader'
import { business } from '../data/business'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

const endpointConfigured = Boolean(import.meta.env.VITE_FORM_ENDPOINT)

export default function Privacy() {
  useDocumentMeta({ title: 'Privacy', description: `How ${business.fullName} handles the details you share on this website.` })

  return (
    <>
      <PageHeader eyebrow="Privacy" title="What we do with your details." />
      <section className="bg-paper py-16 md:py-24">
        <div className="container-x max-w-3xl space-y-10 leading-relaxed text-ink-soft">
          <div>
            <h2 className="font-display text-2xl text-forest">What this website collects</h2>
            <p className="mt-3">
              This website does not use advertising or analytics cookies, and it does not track you across other sites. Fonts and
              images are served from this site itself.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl text-forest">The quote form</h2>
            <p className="mt-3">
              {endpointConfigured
                ? 'When you send the contact form, the details you type (name, email, phone, the service you want and your message) are sent to us so we can reply with a quote.'
                : `The contact form builds a message from what you type. Nothing is sent until you press send in WhatsApp or in your email app, so the details reach ${business.fullName} through those services and are subject to their own privacy policies.`}
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl text-forest">How we use it</h2>
            <p className="mt-3">
              To answer your request, give you a quote and arrange a cleaning.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl text-forest">Questions or removal</h2>
            <p className="mt-3">
              To ask what we hold about you, or to have it deleted, email{' '}
              <a className="font-medium text-forest underline underline-offset-4" href={`mailto:${business.email}`}>
                {business.email}
              </a>{' '}
              or message us on WhatsApp at {business.phone}.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
