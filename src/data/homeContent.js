/**
 * Homepage copy for the Mercy Solution Inc. DEMO. The company name, owner, phone and email are real;
 * everything else here (years, story, promise, areas) is invented for the demonstration. See
 * src/data/business.js for the facts and the `isDemo` switch.
 */
import { business } from './business'

const years = business.yearsExperience

export const trust = {
  eyebrow: 'Why Ottawa books us',
  heading: 'Clean you can feel the moment you walk in.',
  lede: `${business.fullName} is a family-run cleaning company founded by ${business.owner.name}. We clean homes and workplaces across Ottawa with care, consistency and an eye for the details people notice.`,
  points: [
    { icon: 'Award', title: `${years} years of experience`, text: `${years} years of professional cleaning for homes and businesses across Ottawa.` },
    { icon: 'Leaf', title: 'Eco-friendly products', text: 'Non-toxic cleaning supplies that are safe for kids, pets and sensitive skin.' },
    { icon: 'ShieldCheck', title: 'Our re-clean promise', text: 'Missed a spot? Tell us within 24 hours and we will come back and fix it at no charge.' },
    { icon: 'CalendarClock', title: 'Flexible scheduling', text: 'One-time, weekly or monthly visits, with same-day appointments on request.' },
  ],
}

export const about = {
  eyebrow: 'About us',
  heading: 'More Than Clean. A Feeling of Home.',
  paragraphs: [
    `${business.fullName} was founded by ${business.owner.name} after years of cleaning for friends and neighbours who kept asking for more. What began as one person with a bucket and a lot of pride is now a small, trusted team serving homes and businesses across Ottawa.`,
    `${business.owner.name.split(' ')[0]} still talks to every new client herself. We listen first, plan each visit around your space and your routine, and work room by room so nothing is rushed or missed.`,
  ],
  quote: {
    text: 'A clean home is not about perfection. It is about walking in and feeling that you can finally breathe.',
    by: `${business.owner.name}, ${business.owner.role.toLowerCase()}`,
  },
  values: [
    { title: 'Care first', text: 'We treat every home as if it were our own.' },
    { title: 'A team you can trust', text: 'Trained, on time and managed directly by the owner.' },
    { title: 'Made right', text: 'If anything is missed, we come back within 24 hours.' },
  ],
  cta: { label: 'Get Your Free Quote', to: '/contact' },
  imageAlt: 'A gloved hand holding a soft feather duster in a bright kitchen with a marble counter',
}

export const whyChoose = {
  eyebrow: 'Why choose us',
  heading: 'Reliable, affordable and personal.',
  items: [
    { icon: 'Award', title: `${years} years of experience`, text: 'A seasoned team that knows what every kind of space needs.' },
    { icon: 'Leaf', title: 'Eco-friendly products', text: 'Non-toxic supplies that still deliver professional-grade results.' },
    { icon: 'SlidersHorizontal', title: 'Tailored to you', text: 'Cleaning shaped around your lifestyle, your space and your budget.' },
    { icon: 'CalendarClock', title: 'Flexible scheduling', text: 'Pick the days and the rhythm that fit your week.' },
    { icon: 'ShieldCheck', title: 'Our re-clean promise', text: 'Not perfect? We return within 24 hours and make it right.' },
  ],
  eco: {
    eyebrow: `Go green with ${business.name}`,
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

export const video = {
  eyebrow: 'See us at work',
  heading: 'Watch a home come back to life.',
  lede: `Room by room, surface by surface. Here is what a ${business.name} visit looks like from the inside.`,
  points: [
    'We work room by room, from the top down, so nothing is cleaned twice',
    'Eco-friendly products on every surface, safe for kids and pets',
    'A final walk-through before we leave, so you see the result first',
  ],
  cta: { label: 'Book a Clean', to: '/contact' },
  poster: '/videos/bright-living-room-poster.webp',
  src: '/videos/bright-living-room.mp4',
  description: 'A woman vacuums the floor of a bright living room beside a light grey sofa and a tall window. The clip has no sound.',
  demoNote: 'Sample footage: a free stock video used for demonstration, not Mercy Solution staff.',
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
  heading: 'Proudly serving Ottawa and the communities around it.',
  text: "We clean homes and businesses across Ottawa and nearby communities. If you're not sure we cover your address, send us a message and we'll tell you.",
}

export const faqs = [
  {
    q: "What's included in a cleaning?",
    a: 'It depends on the service. A regular residential clean covers every room, from kitchens and bathrooms to bedrooms and living areas; a deep clean goes further into ovens, grout, cabinets and baseboards. Your quote lists exactly what is included, and you can ask for anything extra.',
  },
  {
    q: 'Do you bring your own cleaning supplies?',
    a: 'Yes. We bring eco-friendly, non-toxic supplies that are safe for kids, pets and sensitive skin. If you prefer particular products, tell us when you request your quote.',
  },
  {
    q: 'Who will be cleaning my home?',
    a: `A small, trained team that ${business.owner.name.split(' ')[0]} manages directly. For regular visits you will usually see the same familiar faces.`,
  },
  {
    q: 'What if I am not happy with the result?',
    a: 'Tell us within 24 hours and we will come back and fix whatever was missed, at no charge. That is our re-clean promise.',
  },
  {
    q: 'Can I book a regular, recurring cleaning?',
    a: 'Yes. Choose weekly, every two weeks or monthly when you request your quote, or a daily or custom schedule for an office. You can change the rhythm later.',
  },
  {
    q: 'Can I get a same-day appointment?',
    a: 'We offer same-day appointments on request, depending on availability. Message us on WhatsApp and we will confirm what is possible.',
  },
  {
    q: 'Is the estimator price my final price?',
    a: 'No. The estimator gives a rough range from a few answers, and the figures on this demo site are placeholder values. Your quote from us is the price that counts.',
  },
]

export const finalCta = {
  heading: 'Your Home Deserves This Feeling.',
  text: 'Contact us today for a free cleaning quote, a free consultation or a same-day appointment.',
  cta: { label: 'Get Your Free Quote', to: '/contact' },
  imageAlt: 'A beautiful, airy, perfectly clean living room full of warm daylight',
}
