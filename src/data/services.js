/**
 * The six services in the Mercy Solution Inc. demo. The descriptions are invented for the demo.
 * Images live in src/assets/images/services/<slug>.webp (Unsplash photos and Higgsfield-generated
 * photos, built by scripts/build-section-images.mjs). `estimatorKey` ties each service to
 * src/data/pricing.js.
 */
const images = import.meta.glob('/src/assets/images/services/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
})
const img = (slug) => images[`/src/assets/images/services/${slug}.webp`]

export const services = [
  {
    slug: 'residential-cleaning',
    name: 'Residential Cleaning',
    short: 'A spotless home without the stress, from kitchens and bathrooms to bedrooms and living areas.',
    long: 'Enjoy a spotless home without the stress. We clean every corner, from kitchens and bathrooms to bedrooms and living areas, on a regular schedule or as a one-time refresh.',
    includes: ['Weekly, every-two-weeks, monthly or one-time visits', 'Eco-friendly cleaning supplies', 'Flexible scheduling to fit your week'],
    estimatorKey: 'residential',
    image: img('residential-cleaning'),
    alt: 'A bright, tidy living room with a sofa, a rug and sunlight through the windows',
  },
  {
    slug: 'deep-cleaning',
    name: 'Deep Cleaning',
    short: 'A top-to-bottom reset for the grime a regular visit does not reach.',
    long: 'For the build-up that ordinary cleaning leaves behind. We scrub grout and tile, clean inside ovens, fridges and cabinets, and detail baseboards, doors and light switches. A deep clean is a great reset before a season, an event or the start of a regular schedule.',
    includes: ['Grout, tile and fixture scrubbing', 'Inside the oven, fridge and cabinets', 'Baseboards, doors and light switches'],
    estimatorKey: 'deep',
    image: img('deep-cleaning'),
    alt: 'A spotless white bathroom with gleaming tile and a polished faucet',
  },
  {
    slug: 'move-in-move-out-cleaning',
    name: 'Move-In / Move-Out Cleaning',
    short: 'Moving is stressful. We make your old or new space look perfect.',
    long: "Moving is stressful, so let us handle the cleaning. We'll make sure your old or new space looks perfect, ready for the next chapter.",
    includes: ['Detailed cleaning of walls, floors and appliances', 'Ideal for tenants, landlords and property managers', 'Cabinet and closet cleaning included'],
    estimatorKey: 'move',
    image: img('move-in-move-out-cleaning'),
    alt: 'An empty, sunlit room with polished wooden floors and two cardboard boxes',
  },
  {
    slug: 'post-construction-cleaning',
    name: 'Post-Construction Cleaning',
    short: 'After renovations, dust and debris make a space feel unfinished. We bring it back to perfection.',
    long: 'After renovations, dust and debris can make your space feel unfinished. We bring it back to perfection with detailed dust and debris removal, polished surfaces and sanitized kitchens, bathrooms and work areas.',
    includes: ['Removal of dust, paint and debris from floors, walls and ceilings', 'Window and surface polishing for a spotless finish', 'Final touch-ups that make your space move-in ready'],
    estimatorKey: 'postconstruction',
    image: img('post-construction-cleaning'),
    alt: 'A bright, freshly renovated empty room with a wooden stepladder, ready for its final clean',
  },
  {
    slug: 'office-commercial-cleaning',
    name: 'Office & Commercial Cleaning',
    short: 'A spotless, hygienic and welcoming workplace for clients and employees.',
    long: 'Keep your workplace spotless, hygienic and welcoming for clients and employees, on a daily, weekly or customized schedule, including after hours.',
    includes: ['Daily, weekly or customized schedules', 'Trash removal, dusting, floors and restrooms', 'After-hours cleaning available'],
    estimatorKey: 'office',
    image: img('office-commercial-cleaning'),
    alt: 'A bright open-plan office with tidy desks and tall windows',
  },
  {
    slug: 'airbnb-short-term-rental-cleaning',
    name: 'Airbnb & Short-Term Rental Cleaning',
    short: "Make every guest's stay sparkle. We clean and reset your rental quickly and efficiently.",
    long: "Make every guest's stay sparkle. We clean and reset your rental property quickly and efficiently, so the next arrival walks into a fresh, welcoming space.",
    includes: ['Bed making and linen refresh', 'Kitchen and bathroom sanitization', 'Restocking essentials on request'],
    estimatorKey: 'airbnb',
    image: img('airbnb-cleaning'),
    alt: 'A freshly made bed with white linen beside a bright window',
  },
]

export const getService = (slug) => services.find((s) => s.slug === slug)
