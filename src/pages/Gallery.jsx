import PageHeader from '../components/common/PageHeader'
import BeforeAfter from '../sections/Gallery/BeforeAfter'
import FinalCta from '../sections/CTA/FinalCta'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

export default function Gallery() {
  useDocumentMeta({
    title: 'Before and After Gallery',
    description: 'Drag to compare rooms before and after a professional clean. Demonstration images until real Mercy Solution photos are added.',
  })

  return (
    <>
      <PageHeader
        eyebrow="Gallery"
        title="The difference a proper clean makes."
        lede="Choose a room and drag the handle across the photo."
      />
      <BeforeAfter showLink={false} />
      <FinalCta />
    </>
  )
}
