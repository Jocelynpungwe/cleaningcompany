/**
 * SAMPLE testimonials for the Mercy Solution Inc. DEMO. The customers, quotes and neighbourhoods are
 * fictional: they were written to show how the section looks. The section says so on screen while
 * `testimonialsMeta.isDemo` is true. Before a real launch, replace every entry with a real review
 * (with the customer's permission) and set `isDemo: false`.
 *
 * Shape: { quote, name, detail, rating }  (rating is 1 to 5; leave it out if none was given)
 * These are deliberately NOT included in the page's structured data, so search engines never see
 * invented reviews or star ratings.
 */
export const testimonialsMeta = {
  isDemo: true,
  note: 'Sample reviews written for this demonstration site. They are not from real customers.',
}

export const testimonials = [
  {
    quote:
      'I booked a deep clean before my in-laws arrived and honestly did not recognise my own kitchen afterwards. The oven looked brand new, and Martha even called the next day to make sure everything was perfect.',
    name: 'Priya S.',
    detail: 'Barrhaven · Deep cleaning',
    rating: 5,
  },
  {
    quote:
      'They come every second Friday now. The team is on time, works quietly, and the house smells fresh without that heavy chemical smell. Our toddler and our dog are completely fine around everything they use.',
    name: 'Daniel R.',
    detail: 'Kanata · Recurring home cleaning',
    rating: 5,
  },
  {
    quote:
      'Our renovation left a thick layer of drywall dust in every room. They came through in a single day and the place was move-in ready. I would not have believed it if I had not seen it.',
    name: 'Claire and Tom M.',
    detail: 'Orleans · Post-construction cleaning',
    rating: 5,
  },
  {
    quote:
      'I manage three short-term rentals and turnovers are tight. Mercy Solution resets each unit between guests, fresh linens included, and my guests have mentioned how clean everything is ever since.',
    name: 'Amina H.',
    detail: 'Centretown · Short-term rental cleaning',
    rating: 5,
  },
  {
    quote:
      'Our office is cleaned after hours and we have never had a missed visit. When one spot was overlooked, Martha sent someone back the same evening. That is exactly why we stayed.',
    name: 'Jordan L.',
    detail: 'Nepean · Office cleaning',
    rating: 5,
  },
  {
    quote:
      'They cleaned the whole apartment, including inside the cupboards, and I got my full deposit back. They ran about twenty minutes late but called ahead, and the work was excellent.',
    name: 'Michelle D.',
    detail: 'Stittsville · Move-out cleaning',
    rating: 4,
  },
]
