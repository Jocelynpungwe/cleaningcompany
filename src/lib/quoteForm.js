import { z } from 'zod'
import { services } from '../data/services'
import { pricing } from '../data/pricing'

export const serviceOptions = [
  ...services.map((s) => ({ value: s.slug, label: s.name })),
  { value: 'not-sure', label: "I'm not sure yet" },
]
export const sizeOptions = pricing.sizes.map((s) => ({ value: s.id, label: `${s.label} (${s.hint})` }))
export const frequencyOptions = pricing.frequencies.map((f) => ({ value: f.id, label: f.label }))

/** Today as YYYY-MM-DD in the visitor's own time zone (toISOString would give the UTC date). */
export const today = () => {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export const quoteSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(80, 'That name is too long.'),
  email: z.email('Please enter a valid email address, like name@example.com.'),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s().-]{7,20}$/, 'Please enter a phone number we can reach you on, using digits only.'),
  service: z.string().min(1, 'Please choose a service.'),
  size: z.string().optional(),
  frequency: z.string().optional(),
  date: z
    .string()
    .optional()
    .refine((v) => !v || v >= today(), 'Please choose today or a later date.'),
  area: z.string().trim().max(60, 'Please keep this under 60 characters.').optional(),
  message: z
    .string()
    .trim()
    .min(10, 'Please tell us a little about your space (at least 10 characters).')
    .max(1500, 'Please keep your message under 1,500 characters.'),
  website: z.string().max(0).optional(), // honeypot: real people never fill it
})

const label = (options, value) => options.find((o) => o.value === value)?.label

/** Plain-text version of the request, used for WhatsApp, email and the optional endpoint. */
export function buildMessage(v, estimate) {
  const lines = [
    "Hello VitaGrace, I'd like a quote.",
    '',
    `Name: ${v.name}`,
    `Phone: ${v.phone}`,
    `Email: ${v.email}`,
    `Service: ${label(serviceOptions, v.service) ?? v.service}`,
  ]
  if (v.size) lines.push(`Space: ${label(sizeOptions, v.size)}`)
  if (v.frequency) lines.push(`Frequency: ${label(frequencyOptions, v.frequency)}`)
  if (v.date) lines.push(`Preferred date: ${v.date}`)
  if (v.area) lines.push(`Area: ${v.area}`)
  if (estimate?.range) lines.push(`Website estimate (demonstration figures): ${estimate.range}`)
  lines.push('', v.message)
  return lines.join('\n')
}
