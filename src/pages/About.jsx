import PageHeader from '../components/common/PageHeader'
import AboutPreview from '../sections/About/AboutPreview'
import WhyChoose from '../sections/Why/WhyChoose'
import ServiceAreas from '../sections/Areas/ServiceAreas'
import FinalCta from '../sections/CTA/FinalCta'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { business } from '../data/business'

export default function About() {
  useDocumentMeta({
    title: `About ${business.fullName}`,
    description: `A family-run Ottawa cleaning company founded by ${business.owner.name}. ${business.yearsExperience} years of care, eco-friendly products and a 24-hour re-clean promise.`,
  })

  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="Care, reliability and a little sparkle."
        lede={`${business.fullName} has been cleaning homes and businesses across Ottawa for ${business.yearsExperience} years, led by founder ${business.owner.name}.`}
      />
      <AboutPreview id="story" />
      <WhyChoose />
      <ServiceAreas />
      <FinalCta />
    </>
  )
}
