import Button from '../ui/Button'
import { useDocumentMeta } from '../../hooks/useDocumentMeta'

/**
 * Honest placeholder for pages scheduled for a later build phase.
 * Not a real page: it says so, and offers working navigation.
 */
export default function PageStub({ title, phase, description }) {
  useDocumentMeta({ title, description })
  return (
    <section className="bg-paper pb-28 pt-40">
      <div className="container-x max-w-3xl">
        <p className="eyebrow text-forest">Planned · {phase}</p>
        <h1 className="font-display mt-4 text-5xl text-forest md:text-6xl">{title}</h1>
        <p className="mt-6 max-w-xl text-lg text-ink-soft">{description}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button to="/" variant="secondary">
            Back to home
          </Button>
          <Button to="/contact" arrow>
            Get Your Free Quote
          </Button>
        </div>
      </div>
    </section>
  )
}
