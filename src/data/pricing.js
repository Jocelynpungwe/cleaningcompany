/**
 * Estimator configuration. EVERY NUMBER HERE IS A DEMONSTRATION VALUE, not Mercy Solution's real
 * rate: the owner has not supplied prices. While `isDemo` is true the estimator labels its
 * result "demonstration estimate" so no visitor mistakes it for a quote.
 *
 * To go live: enter the real rates, set `isDemo: false`, and review the wording of the
 * disclaimer in src/sections/Estimator/Estimator.jsx.
 */
export const pricing = {
  isDemo: true,
  currency: 'CAD',
  // The displayed range is the computed price widened by these factors, rounded to `round`.
  range: { low: 0.9, high: 1.2 },
  round: 5,

  // Base price per visit for a medium-sized space.
  services: {
    residential: { label: 'Residential Cleaning', base: 140 },
    deep: { label: 'Deep Cleaning', base: 220 },
    move: { label: 'Move-In / Move-Out Cleaning', base: 220 },
    postconstruction: { label: 'Post-Construction Cleaning', base: 320 },
    office: { label: 'Office & Commercial Cleaning', base: 180 },
    airbnb: { label: 'Airbnb & Short-Term Rental Cleaning', base: 110 },
  },

  sizes: [
    { id: 'small', label: 'Small', hint: 'Under 800 sq ft', factor: 0.75 },
    { id: 'medium', label: 'Medium', hint: '800 to 1,500 sq ft', factor: 1 },
    { id: 'large', label: 'Large', hint: '1,500 to 2,500 sq ft', factor: 1.45 },
    { id: 'xlarge', label: 'Extra large', hint: 'Over 2,500 sq ft', factor: 1.95 },
  ],

  perBathroom: 18, // added for each bathroom beyond the first
  maxBathrooms: 6,

  frequencies: [
    { id: 'once', label: 'One time', factor: 1 },
    { id: 'monthly', label: 'Monthly', factor: 0.95 },
    { id: 'biweekly', label: 'Every 2 weeks', factor: 0.9 },
    { id: 'weekly', label: 'Weekly', factor: 0.85 },
  ],

  extras: [
    { id: 'oven', label: 'Inside the oven', price: 35 },
    { id: 'fridge', label: 'Inside the fridge', price: 30 },
    { id: 'windows', label: 'Interior windows', price: 45 },
    { id: 'cabinets', label: 'Inside cabinets', price: 40 },
  ],
}

const roundTo = (n, step) => Math.round(n / step) * step

/** @returns {{low:number, high:number}} */
export function estimate({ service, size, bathrooms, frequency, extras }) {
  const s = pricing.services[service]
  const z = pricing.sizes.find((x) => x.id === size)
  const f = pricing.frequencies.find((x) => x.id === frequency)
  if (!s || !z || !f) return null
  const bath = Math.max(0, Number(bathrooms) - 1) * pricing.perBathroom
  const extra = pricing.extras.filter((e) => extras.includes(e.id)).reduce((sum, e) => sum + e.price, 0)
  const raw = (s.base * z.factor + bath + extra) * f.factor
  return {
    low: roundTo(raw * pricing.range.low, pricing.round),
    high: roundTo(raw * pricing.range.high, pricing.round),
  }
}
