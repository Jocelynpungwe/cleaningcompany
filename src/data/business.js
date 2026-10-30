/**
 * Business facts for the DEMO site. Real from the owner: company name, owner name, phone and email.
 * INVENTED for the demonstration (replace before a real launch): years in business, founding story,
 * hours, the neighbourhood list, the re-clean promise, the testimonials and every "about" detail.
 * Set `isDemo: false` to remove the "sample content" notes once real details are in.
 *
 * A `null` / empty value means the UI hides that element.
 */
export const business = {
  isDemo: true,

  name: 'Mercy Solution',
  legalName: 'Mercy Solution Inc.',
  fullName: 'Mercy Solution Inc.',
  descriptor: 'Cleaning Company',
  tagline: 'Spotless spaces, handled with care.',

  owner: { name: 'Martha Argaw', role: 'Founder and owner' },

  city: 'Ottawa',
  region: 'ON',
  country: 'CA',
  areaServed: 'Ottawa & surroundings',

  yearsExperience: 8, // demo value

  phone: '+1 613 695 2579', // also used for WhatsApp links (assumes the number is on WhatsApp)
  phoneHref: 'tel:+16136952579',
  whatsappNumber: '16136952579',
  email: 'marthaargaw0@gmail.com',
  address: null,
  hours: 'Mon to Sat, 8am to 6pm', // demo value

  // Demo list of Ottawa-area communities. Confirm the real coverage before launch.
  serviceAreas: ['Kanata', 'Barrhaven', 'Orleans', 'Nepean', 'Stittsville', 'Gloucester', 'Centretown', 'Vanier'],

  social: [], // { label: 'Instagram', href: 'https://instagram.com/...' }

  siteUrl: import.meta.env.VITE_SITE_URL || 'http://localhost:5173',
}

/** wa.me deep link with a prefilled message. Opens WhatsApp on phone and WhatsApp Web on desktop. */
export const whatsappUrl = (message = `Hello ${business.name}, I'd like a free cleaning quote`) =>
  `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(message)}`

export const mailtoUrl = (subject, body) =>
  `mailto:${business.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
