/**
 * Before/after pairs. THESE ARE DEMONSTRATION IMAGES generated for the site layout, not
 * photographs of VitaGrace's work. The gallery says so on screen (`galleryNote`). Replace
 * with real, permitted before/after photos of the same spot, shot from the same position,
 * then set `isDemo: false`.
 */
const files = import.meta.glob('/src/assets/images/gallery/*.webp', { eager: true, query: '?url', import: 'default' })
const f = (name) => files[`/src/assets/images/gallery/${name}.webp`]

export const galleryMeta = {
  isDemo: true,
  note: 'Made for this website to show how the comparison works. They are not photographs of VitaGrace jobs, and real before-and-after photos will replace them.',
}

export const galleryPairs = [
  {
    id: 'living-room',
    label: 'Living room',
    before: f('living-room-before'),
    after: f('living-room-after'),
    alt: 'A cluttered living room with toys, papers and a stained rug, then the same room tidy and clean',
  },
  {
    id: 'kitchen',
    label: 'Kitchen',
    before: f('kitchen-before'),
    after: f('kitchen-after'),
    alt: 'A greasy kitchen with a burnt hob and a full sink, then the same kitchen spotless',
  },
  {
    id: 'bathroom',
    label: 'Bathroom',
    before: f('bathroom-before'),
    after: f('bathroom-after'),
    alt: 'A grimy bathroom with mouldy grout and towels on the floor, then the same bathroom gleaming white',
  },
  {
    id: 'bedroom',
    label: 'Bedroom',
    before: f('bedroom-before'),
    after: f('bedroom-after'),
    alt: 'A messy, dusty bedroom with clothes on the floor, then the same bedroom made up and fresh',
  },
]
