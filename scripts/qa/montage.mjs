// node montage.mjs <dir> <cols> <cellWidth> <out.png> p000 p022 ...
import sharp from 'sharp'
import path from 'node:path'
const [dir, cols, cellW, out, ...names] = process.argv.slice(2)
const C = +cols
const CW = +cellW
const tiles = []
let cellH = 0
for (const n of names) {
  const buf = await sharp(path.join(dir, n + '.png')).resize({ width: CW }).png().toBuffer()
  const meta = await sharp(buf).metadata()
  cellH = Math.max(cellH, meta.height)
  tiles.push(buf)
}
const rows = Math.ceil(tiles.length / C)
const gap = 8
const comps = tiles.map((input, i) => ({ input, left: (i % C) * (CW + gap), top: Math.floor(i / C) * (cellH + gap) }))
await sharp({ create: { width: C * CW + (C - 1) * gap, height: rows * cellH + (rows - 1) * gap, channels: 3, background: '#222' } })
  .composite(comps)
  .png()
  .toFile(out)
console.log('wrote', out)
