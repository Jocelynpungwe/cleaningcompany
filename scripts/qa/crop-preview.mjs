/**
 * Preview different crops of the hero video at three moments (start, middle, end) before
 * committing to them in scripts/build-frames-from-video.mjs.
 *   node scripts/qa/crop-preview.mjs <video> <outDir> "desktop:0.07:0.70,0.10:0.62" "mobile:0.20:0.84,0.25:0.70"
 * desktop spec: x0:widthFraction (16:9 crop, anchored to the bottom of the frame)
 * mobile  spec: x0:heightFraction (9:16 crop, anchored to the bottom of the frame)
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const [video, outDir, ...specs] = process.argv.slice(2)
mkdirSync(outDir, { recursive: true })

function findFfmpeg() {
  const pk = path.join(process.env.LOCALAPPDATA || '', 'Microsoft/WinGet/Packages')
  const walk = (d, depth = 0) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name)
      if (e.isFile() && e.name.toLowerCase() === 'ffmpeg.exe') return p
      if (e.isDirectory() && depth < 4) {
        const r = walk(p, depth + 1)
        if (r) return r
      }
    }
  }
  return process.env.FFMPEG || (existsSync(pk) && walk(pk)) || 'ffmpeg'
}
const ffmpeg = findFfmpeg()
const times = [0, 3, 5.95]
for (const t of times) spawnSync(ffmpeg, ['-y', '-v', 'error', '-ss', String(t), '-i', video, '-frames:v', '1', path.join(outDir, `full-${t}.png`)])

const W = 1920
const H = 1088
const parse = (s) => {
  const i = s.indexOf(':')
  return { kind: s.slice(0, i), items: s.slice(i + 1).split(',').map((p) => p.split(':').map(Number)) }
}
for (const raw of specs) {
  const { kind, items } = parse(raw)
  const tiles = []
  const tw = kind === 'desktop' ? 640 : 270
  const th = kind === 'desktop' ? 360 : 480
  items.forEach(([x0, size], col) => {
    times.forEach((t, row) => {
      let box
      if (kind === 'desktop') {
        const w = Math.round(size * W)
        const h = Math.round((w * 9) / 16)
        box = { left: Math.round(x0 * W), top: H - h, width: w, height: h }
      } else {
        const h = Math.round(size * H)
        const w = Math.round((h * 9) / 16)
        box = { left: Math.min(W - w, Math.round(x0 * W)), top: H - h, width: w, height: h }
      }
      tiles.push(
        sharp(path.join(outDir, `full-${t}.png`))
          .extract(box)
          .resize(tw, th)
          .png()
          .toBuffer()
          .then((input) => ({ input, left: col * (tw + 8), top: row * (th + 8) })),
      )
    })
  })
  const composite = await Promise.all(tiles)
  await sharp({ create: { width: items.length * (tw + 8), height: 3 * (th + 8), channels: 3, background: '#222' } })
    .composite(composite)
    .png()
    .toFile(path.join(outDir, `${kind}-candidates.png`))
  console.log('wrote', `${kind}-candidates.png`)
}
