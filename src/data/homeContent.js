/**
 * Homepage copy. Facts come from the owner (see src/data/business.js): six years in Ottawa,
 * eco-friendly non-toxic products, satisfaction guaranteed, free quote, same-day appointments.
 * No review, award, licence, insurance or price is stated anywhere because none was supplied.
 */
import { business } from './business'

export const trust = {
  eyebrow: 'Why Ottawa books us',
  heading: 'Trusted hands for a sparkling home.',
  lede: 'Professional, reliable and affordable cleaning for homes and businesses across Ottawa, done with care and respect for the space you live and work in.',
  points: [
    { icon: 'Award', title: `${business.yearsExperience} years of experience`, text: 'Six years of professional cleaning for homes and businesses in Ottawa.' },
    { icon: 'Leaf', title: 'Eco-friendly products', text: 'Non-toxic cleaning supplies that are safe for kids, pets and sensitive skin.' },
    { icon: 'ShieldCheck', title: 'Satisfaction guaranteed', text: 'Your happiness is our top priority, on every visit.' },
    { icon: 'CalendarClock', title: 'Flexible scheduling', text: 'Regular, deep or one-time visits, with same-day appointments available on request.' },
  ],
}

export const about = {
  eyebrow: 'About us',
  heading: 'More Than Clean. A Feeling of Home.',
  paragraphs: [
    'At VitaGrace Cleaning Services, we bring sparkle, care and reliability to every home and business in Ottawa.',
    'Our friendly, professional cleaners go above and beyond to make sure your space feels fresh, spotless and peaceful, every single time. We treat every home with care and respect.',
  ],
  values: [
    { title: 'Serving with love', text: 'We treat every home with care and respect.' },
    { title: 'Trusted and reliable', text: 'Six years of proven work in Ottawa.' },
    { title: 'Satisfaction guaranteed', text: 'Your happiness is our top priority.' },
  ],
  cta: { label: 'Get Your Free Quote', to: '/contact' },
  imageAlt: 'A gloved hand holding a soft feather duster in a bright kitchen with a marble counter',
}

export const whyChoose = {
  eyebrow: 'Why choose us',
  heading: 'Reliable, affordable and professional.',
  items: [
    { icon: 'Award', title: 'Six years of experience', text: 'Six years of professional cleaning for homes and businesses across Ottawa.' },
    { icon: 'Leaf', title: 'Eco-friendly products', text: 'Non-toxic supplies that still deliver professional-grade results.' },
    { icon: 'SlidersHorizontal', title: 'Tailored to you', text: 'Cleaning shaped around your lifestyle, your space and your budget.' },
    { icon: 'CalendarClock', title: 'Flexible scheduling', text: 'Pick the days and the rhythm that fit your week.' },
    { icon: 'ShieldCheck', title: 'Satisfaction guaranteed', text: 'We go above and beyond to exceed your expectations.' },
  ],
  eco: {
    eyebrow: 'Go green with VitaGrace',
    heading: 'Choosing green cleaning means caring for your family and the earth, one clean room at a time.',
    points: [
      'Safe for kids, pets and sensitive skin',
      'Reduces harsh chemical exposure',
      'Environmentally sustainable',
      'Smells fresh and natural',
      'Still delivers professional-grade results',
    ],
  },
}

export const process = {
  eyebrow: 'How it works',
  heading: 'From first message to fresh home.',
  steps: [
    { icon: 'MessageSquareText', title: 'Tell Us About Your Space', text: 'Message us on WhatsApp or use the form with the size, the rooms and what matters most.' },
    { icon: 'ListChecks', title: 'Choose Your Cleaning Service', text: 'Pick the service that fits, from a regular clean to a post-construction finish.' },
    { icon: 'CalendarCheck', title: 'Schedule Your Appointment', text: 'Choose a date and time, one-off or repeating. Same-day appointments are available on request.' },
    { icon: 'Home', title: 'Enjoy Your Fresh, Clean Home', text: 'Come back to a space that feels fresh, spotless and peaceful.' },
  ],
}

export const serviceAreas = {
  eyebrow: 'Where we work',
  heading: 'Proudly serving Ottawa and surroundings.',
  text: "We clean homes and businesses across Ottawa and the surrounding area. If you're not sure we cover your address, send us a message and we'll tell you.",
}

export const faqs = [
  {
    q: "What's included in a cleaning?",
    a: 'It depends on the service. Residential cleaning covers every corner of the home, from kitchens and bathrooms to bedrooms and living areas, as a regular, deep or one-time clean. Your quote lists exactly what is included, and you can ask for anything extra.',
  },
  {
    q: 'Do you bring your own cleaning supplies?',
    a: 'We use eco-friendly, non-toxic cleaning supplies, which are safe for kids, pets and sensitive skin. If you have a preference for particular products, tell us when you request your quote.',
  },
  {
    q: 'Can I book a regular, recurring cleaning?',
    a: 'Yes. Choose a regular schedule, or a daily, weekly or custom one for an office, when you request your quote. You can ask to change the rhythm later.',
  },
  {
    q: 'Can I get a same-day appointment?',
    a: 'We offer same-day appointments on request. Message us on WhatsApp and we will confirm what is possible.',
  },
  {
    q: 'Which areas do you serve?',
    a: 'We serve Ottawa and the surrounding area. If you are unsure about your address, send us a message and we will let you know.',
  },
  {
    q: 'How do I get a quote?',
    a: 'Quotes are free. Use the estimator for a rough idea, then press Request My Quote to send us the details on WhatsApp, or use the contact form. We reply with a quote for your space.',
  },
  {
    q: 'Is the estimator price my final price?',
    a: 'No. The estimator gives a rough range from a few answers, and the figures on this site are demonstration values until the real rates are entered. Your quote from us is the price that counts.',
  },
]

export const finalCta = {
  heading: 'Your Home Deserves This Feeling.',
  text: 'Contact us today for a free cleaning quote, a free consultation or a same-day appointment.',
  cta: { label: 'Get Your Free Quote', to: '/contact' },
  imageAlt: 'A beautiful, airy, perfectly clean living room full of warm daylight',
}
