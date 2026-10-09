/**
 * Downloads Unsplash photos by their photo-page id (the trailing token of unsplash.com/photos/<slug>-<id>)
 * and optionally lays them out as a numbered contact sheet for choosing.
 *
 *   node scripts/fetch-unsplash.mjs sheet <name> <id> <id> ...   -> review/unsplash/<name>.jpg (+ thumbs cache)
 *   node scripts/fetch-unsplash.mjs full  <id> [width]           -> review/unsplash/full/<id>.jpg
 *
 * Unsplash licence: free to use, including commercially, no permission or attribution required
 * (credit is appreciated). Unsplash+ images need a subscription and are not used here.
 */
import sharp from 'sharp'
import { mkdirSync, existsSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'review/unsplash')
const UA = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36' }
mkdirSync(path.join(OUT, 'thumbs'), { recursive: true })
mkdirSync(path.join(OUT, 'full'), { recursive: true })

async function cdnUrl(id) {
  // CDN ids ("photo-1664890289644-dead6418417c") work directly; page ids go through the download redirect.
  if (id.startsWith('photo-')) return new URL(`https://images.unsplash.com/${id}`)
  const res = await fetch(`https://unsplash.com/photos/${id}/download?force=true`, { redirect: 'manual', headers: UA })
  const loc = res.headers.get('location')
  if (!loc) throw new Error(`no redirect for ${id} (status ${res.status})`)
  return new URL(loc)
}

async function get(id, width, cacheDir) {
  const file = path.join(OUT, cacheDir, `${id}.jpg`)
  if (existsSync(file)) return file
  const url = await cdnUrl(id)
  url.searchParams.set('w', String(width))
  url.searchParams.set('q', cacheDir === 'full' ? '85' : '70')
  url.searchParams.set('fm', 'jpg')
  const res = await fetch(url, { headers: UA })
  if (!res.ok) throw new Error(`download ${id}: ${res.status}`)
  writeFileSync(file, Buffer.from(await res.arrayBuffer()))
  return file
}

const [mode, ...rest] = process.argv.slice(2)

if (mode === 'sheet') {
  const [name, ...ids] = rest
  const cols = 4, w = 440, h = 300, gap = 8
  const rows = Math.ceil(ids.length / cols)
  const tiles = []
  for (let i = 0; i < ids.length; i++) {
    try {
      const f = await get(ids[i], 700, 'thumbs')
      const img = await sharp(f).resize(w, h, { fit: 'cover' }).toBuffer()
      const label = Buffer.from(`<svg width="${w}" height="${h}"><rect x="8" y="8" rx="14" width="${String(i + 1).length * 14 + 22}" height="28" fill="#000c"/><text x="19" y="28" font-family="Arial" font-size="18" font-weight="700" fill="#fff">${i + 1}</text></svg>`)
      tiles.push({ input: await sharp(img).composite([{ input: label }]).toBuffer(), left: (i % cols) * (w + gap), top: Math.floor(i / cols) * (h + gap) })
    } catch (e) {
      console.warn('skip', ids[i], e.message)
    }
  }
  await sharp({ create: { width: cols * (w + gap), height: rows * (h + gap), channels: 3, background: '#111' } })
    .composite(tiles).jpeg({ quality: 82 }).toFile(path.join(OUT, `${name}.jpg`))
  console.log(ids.map((id, i) => `${i + 1}=${id}`).join('  '))
} else if (mode === 'full') {
  const [id, width = '2400'] = rest
  console.log(await get(id, Number(width), 'full'))
} else {
  console.error('usage: sheet <name> <ids...> | full <id> [width]')
  process.exit(1)
}
