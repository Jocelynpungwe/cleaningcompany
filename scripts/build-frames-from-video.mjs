/**
 * Turns the approved hero VIDEO into the scroll frame sequence the hero plays.
 *
 *   node scripts/build-frames-from-video.mjs <video.mp4> [--desktop 72] [--mobile 36] [--mobile-x 0.66] [--quality 70] [--width 1920]
 *
 *   desktop: 16:9, 1920 wide, N frames evenly spaced over the whole clip  -> src/assets/images/hero/desktop
 *   mobile : 9:16 crop of the same video (centre at --mobile-x of the width), 720x1280 -> src/assets/images/hero/mobile
 *
 * Uses ffmpeg (resolved from PATH, $FFMPEG, or the winget install folder). Frames are numbered
 * frame-001.webp ... in time order, which is exactly what src/data/heroSequence.js globs.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const video = args.find((a) => !a.startsWith('--'))
const opt = (name, d) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? Number(args[i + 1]) : d
}
if (!video) {
  console.error('usage: node scripts/build-frames-from-video.mjs <video.mp4> [--desktop 72] [--mobile 36] [--mobile-x 0.66] [--quality 70]')
  process.exit(1)
}
const DESKTOP = opt('desktop', 72)
const MOBILE = opt('mobile', 36)
const MOBILE_X = opt('mobile-x', 0.66)
const Q = opt('quality', 70)
const WIDTH = opt('width', 1920) // desktop frame width in px
// Floor-focused crops, both anchored to the BOTTOM of the video (the floor is the subject):
//   --desktop-crop "x0,widthFraction"   16:9 crop, e.g. "0.07,0.64"
//   --mobile-crop  "x0,heightFraction"  9:16 crop, e.g. "0.24,0.70"
const optPair = (name) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1].split(',').map(Number) : null
}
const DESKTOP_CROP = optPair('desktop-crop')
const MOBILE_CROP = optPair('mobile-crop')

function findFfmpeg() {
  if (process.env.FFMPEG && existsSync(process.env.FFMPEG)) return process.env.FFMPEG
  const probe = spawnSync(os.platform() === 'win32' ? 'where' : 'which', ['ffmpeg'], { encoding: 'utf8' })
  if (probe.status === 0) return probe.stdout.split(/\r?\n/)[0].trim()
  const pk = path.join(process.env.LOCALAPPDATA || '', 'Microsoft/WinGet/Packages')
  if (existsSync(pk)) {
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
    const f = walk(pk)
    if (f) return f
  }
  throw new Error('ffmpeg not found (install it, or set FFMPEG=path)')
}
const ffmpeg = findFfmpeg()

// duration + size from ffmpeg's banner
const info = spawnSync(ffmpeg, ['-i', video], { encoding: 'utf8' }).stderr
const dm = info.match(/Duration:\s*(\d+):(\d+):([\d.]+)/)
const duration = dm ? +dm[1] * 3600 + +dm[2] * 60 + +dm[3] : NaN
const sm = info.match(/,\s*(\d{3,5})x(\d{3,5})/)
if (!Number.isFinite(duration) || !sm) throw new Error('could not read the video duration/size')
const [W, H] = [+sm[1], +sm[2]]
console.log(`video: ${W}x${H}, ${duration.toFixed(2)}s`)

const MOBILE_Q = opt('mobile-quality', Q)
function extract(label, count, vf, outDir, q = Q) {
  rmSync(outDir, { recursive: true, force: true })
  mkdirSync(outDir, { recursive: true })
  const fps = (count / duration).toFixed(5)
  const r = spawnSync(
    ffmpeg,
    ['-y', '-v', 'error', '-i', video, '-vf', `fps=${fps},${vf}`, '-c:v', 'libwebp', '-quality', String(q), '-compression_level', '5', path.join(outDir, 'frame-%03d.webp')],
    { encoding: 'utf8' },
  )
  if (r.status !== 0) throw new Error(`${label}: ffmpeg failed\n${r.stderr}`)
  const files = readdirSync(outDir).filter((f) => f.endsWith('.webp'))
  const total = files.reduce((s, f) => s + statSync(path.join(outDir, f)).size, 0)
  console.log(`${label}: ${files.length} frames, ${(total / 1048576).toFixed(1)} MB total, avg ${Math.round(total / files.length / 1024)} KB`)
}

const out = path.join(ROOT, 'src/assets/images/hero')
// desktop: optional bottom-anchored 16:9 crop (even sizes keep encoders happy)
let desktopVf = `scale=${WIDTH}:-2`
if (DESKTOP_CROP) {
  const [x0, wf] = DESKTOP_CROP
  const cwd = Math.round((wf * W) / 2) * 2
  const chd = Math.round((cwd * 9) / 16 / 2) * 2
  desktopVf = `crop=${cwd}:${chd}:${Math.round(x0 * W)}:${H - chd},scale=${WIDTH}:-2`
}
extract('desktop', DESKTOP, desktopVf, path.join(out, 'desktop'))

// mobile: 9:16 crop. Default = full-height strip centred at --mobile-x; with --mobile-crop it is
// a tighter bottom-anchored window so the floor fills the middle of the phone screen.
let mobileVf
if (MOBILE_CROP) {
  const [x0, hf] = MOBILE_CROP
  const chm = Math.round((hf * H) / 2) * 2
  const cwm = Math.round((chm * 9) / 16 / 2) * 2
  const cxm = Math.min(W - cwm, Math.round(x0 * W))
  mobileVf = `crop=${cwm}:${chm}:${cxm}:${H - chm},scale=720:1280`
} else {
  const cw = Math.round((H * 9) / 16)
  const cx = Math.min(W - cw, Math.max(0, Math.round(W * MOBILE_X - cw / 2)))
  mobileVf = `crop=${cw}:${H}:${cx}:0,scale=720:1280`
}
extract('mobile', MOBILE, mobileVf, path.join(out, 'mobile'), MOBILE_Q)
console.log('done')
