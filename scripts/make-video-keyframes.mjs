/**
 * Builds the two key frames for the hero video from the master photo and its Higgsfield "dirty" edit.
 *   START = the dirty state, wide 16:9
 *   END   = the original clean photo, 16:9, framed ~20% closer so the camera appears to push in
 * Both are 1920x1080 and are what get uploaded as start_image / end_image.
 *
 *   node scripts/make-video-keyframes.mjs
 */
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dir = path.join(ROOT, 'review/hero/video')
mkdirSync(dir, { recursive: true })

const dirty = path.join(ROOT, 'review/hero/states/state-0-dirty-v1.png')
const clean = path.join(ROOT, 'review/hero/master-photo-L12.jpg')

const jpg = () => ({ quality: 92, mozjpeg: true })

await sharp(dirty).extract({ left: 0, top: 36, width: 2528, height: 1422 }).resize(1920, 1080).jpeg(jpg()).toFile(path.join(dir, 'start-dirty-16x9.jpg'))
await sharp(clean).extract({ left: 330, top: 180, width: 2133, height: 1200 }).resize(1920, 1080).jpeg(jpg()).toFile(path.join(dir, 'end-clean-16x9-pushin.jpg'))
await sharp(clean).extract({ left: 0, top: 40, width: 2560, height: 1440 }).resize(1920, 1080).jpeg(jpg()).toFile(path.join(dir, 'clean-wide-16x9.jpg'))
// ---- FLOOR-FOCUSED framing (take 2) --------------------------------------------------------
// Take 1 cropped from the top and lost the foreground rug, so the dirt sat on the bottom edge.
// Here the crop is anchored to the BOTTOM of the photo: armchair, throw, coffee table, rug and the
// clutter fill the middle of the frame, the wall/window is cropped to a band at the top.
const dirtyMeta = await sharp(dirty).metadata() // 2528 x 1696
const cleanMeta = await sharp(clean).metadata() // 2560 x 1707
const box = (meta, x0, y0, w) => {
  const width = Math.round(w * meta.width)
  const height = Math.round((width * 9) / 16)
  const top = Math.min(meta.height - height, Math.round(y0 * meta.height))
  return { left: Math.round(x0 * meta.width), top, width, height }
}
// start: wide on the whole mess
await sharp(dirty).extract(box(dirtyMeta, 0.125, 0.4, 0.715)).resize(1920, 1080).jpeg(jpg()).toFile(path.join(dir, 'start-dirty-floor-16x9.jpg'))
// end: same region of the clean photo, pushed in ~12% and drifting slightly right, bottom-anchored
{
  const w = Math.round(0.715 * cleanMeta.width * 0.89)
  const height = Math.round((w * 9) / 16)
  const left = Math.round(0.19 * cleanMeta.width)
  await sharp(clean).extract({ left, top: cleanMeta.height - height, width: w, height }).resize(1920, 1080).jpeg(jpg()).toFile(path.join(dir, 'end-clean-floor-16x9.jpg'))
}
console.log('key frames written to', dir)
