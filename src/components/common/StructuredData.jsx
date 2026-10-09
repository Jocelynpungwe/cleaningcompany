import { useEffect } from 'react'
import { business } from '../../data/business'
import { services } from '../../data/services'
import { faqs } from '../../data/homeContent'

/**
 * JSON-LD built ONLY from verified facts in src/data (name, phone, email, area, services, FAQ copy).
 * Deliberately absent because none was supplied: street address, geo, opening hours, price range,
 * ratings or reviews. Add them to business.js / testimonials.js first, then here.
 */
export default function StructuredData({ withFaq = false }) {
  useEffect(() => {
    const graph = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'HouseCleaningService',
          '@id': `${business.siteUrl}/#business`,
          name: business.fullName,
          url: business.siteUrl,
          telephone: business.phone,
          email: business.email,
          areaServed: { '@type': 'City', name: business.city },
          slogan: business.tagline,
          makesOffer: services.map((s) => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: s.name, description: s.short },
          })),
        },
        ...(withFaq
          ? [
              {
                '@type': 'FAQPage',
                mainEntity: faqs.map((f) => ({
                  '@type': 'Question',
                  name: f.q,
                  acceptedAnswer: { '@type': 'Answer', text: f.a },
                })),
              },
            ]
          : []),
      ],
    }
    const el = document.createElement('script')
    el.type = 'application/ld+json'
    el.dataset.managed = 'structured-data'
    el.textContent = JSON.stringify(graph)
    document.head.appendChild(el)
    return () => el.remove()
  }, [withFaq])
  return null
}
