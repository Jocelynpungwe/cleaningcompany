/**
 * Business facts, supplied by the owner (source: vitagraceclean.com and the owner's pasted copy).
 * A `null` / empty value means the UI hides that element, so nothing is ever invented.
 *
 * NOT supplied yet, and therefore not shown anywhere: street address, opening hours, social
 * accounts, customer reviews, prices, licences, insurance or certifications.
 */
export const business = {
  name: 'VitaGrace',
  descriptor: 'Cleaning Services',
  fullName: 'VitaGrace Cleaning Services',
  tagline: 'Trusted hands for a sparkling home.',

  city: 'Ottawa',
  region: 'ON',
  country: 'CA',
  areaServed: 'Ottawa & surroundings',

  yearsExperience: 6,

  phone: '+1 613 853 4419', // the number is also the WhatsApp number
  phoneHref: 'tel:+16138534419',
  whatsappNumber: '16138534419',
  email: 'goldenmart43@gmail.com', // as given by the owner: confirm this is the address to publish
  address: null,
  hours: null,

  // Verified service areas only. The owner gave a region, not neighbourhoods: do not add any unconfirmed.
  serviceAreas: [],

  social: [], // { label: 'Instagram', href: 'https://instagram.com/...' }

  siteUrl: import.meta.env.VITE_SITE_URL || 'http://localhost:5173',
}

/** wa.me deep link with a prefilled message. Opens WhatsApp on phone and WhatsApp Web on desktop. */
export const whatsappUrl = (message = "Hello VitaGrace, I'd like a free cleaning quote") =>
  `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(message)}`

export const mailtoUrl = (subject, body) =>
  `mailto:${business.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
