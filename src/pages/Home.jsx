import Hero from '../sections/Hero/Hero'
import Trust from '../sections/Trust/Trust'
import AboutPreview from '../sections/About/AboutPreview'
import ServicesShowcase from '../sections/Services/ServicesShowcase'
import BeforeAfter from '../sections/Gallery/BeforeAfter'
import CleaningVideo from '../sections/Video/CleaningVideo'
import WhyChoose from '../sections/Why/WhyChoose'
import Process from '../sections/Process/Process'
import Estimator from '../sections/Estimator/Estimator'
import Testimonials from '../sections/Testimonials/Testimonials'
import ServiceAreas from '../sections/Areas/ServiceAreas'
import Faq from '../sections/FAQ/Faq'
import FinalCta from '../sections/CTA/FinalCta'
import StructuredData from '../components/common/StructuredData'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

export default function Home() {
  useDocumentMeta({
    description:
      'Professional, reliable and affordable cleaning for homes and businesses across Ottawa. Residential, move-in/move-out, post-construction, office and Airbnb cleaning. Free quotes.',
  })

  return (
    <>
      <StructuredData withFaq />
      <Hero />
      <Trust />
      <AboutPreview />
      <ServicesShowcase />
      <BeforeAfter />
      <CleaningVideo />
      <WhyChoose />
      <Process />
      <Estimator />
      <Testimonials />
      <ServiceAreas />
      <Faq />
      <FinalCta />
    </>
  )
}
