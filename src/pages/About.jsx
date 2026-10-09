import PageHeader from '../components/common/PageHeader'
import AboutPreview from '../sections/About/AboutPreview'
import WhyChoose from '../sections/Why/WhyChoose'
import ServiceAreas from '../sections/Areas/ServiceAreas'
import FinalCta from '../sections/CTA/FinalCta'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

export default function About() {
  useDocumentMeta({
    title: 'About VitaGrace Cleaning Services',
    description:
      'Six years of professional cleaning for homes and businesses in Ottawa. Friendly cleaners, eco-friendly products and a satisfaction guarantee.',
  })

  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="Care, reliability and a little sparkle."
        lede="VitaGrace Cleaning Services has been cleaning homes and businesses in Ottawa for six years."
      />
      <AboutPreview id="story" />
      <WhyChoose />
      <ServiceAreas />
      <FinalCta />
    </>
  )
}
