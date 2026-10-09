/**
 * Key frames for the kitchen/stove hero video.
 *   START = the dirty stove (Higgsfield image), full frame, 1920x1080
 *   END   = the spotless edit of the SAME image, framed ~10% closer toward the centre burner
 *           (so the camera appears to push in), 1920x1080
 *
 *   node scripts/make-kitchen-keyframes.mjs
 */
import sharp from 'sharp'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dir = path.join(ROOT, 'review/hero/kitchen')
const dirty = path.join(dir, 'start-dirty.png')
const clean = path.join(dir, 'clean-stove-v1.png')
const out = { quality: 92, mozjpeg: true }

const dm = await sharp(dirty).metadata()
const cm = await sharp(clean).metadata()
console.log('dirty', dm.width, dm.height, 'clean', cm.width, cm.height)

await sharp(dirty).resize(1920, 1080, { fit: 'cover' }).jpeg(out).toFile(path.join(dir, 'kitchen-start-dirty-1080.jpg'))

// push-in: crop 90% of the frame, centred slightly right of and below centre (toward the front burner)
const w = Math.round(cm.width * 0.9)
const h = Math.round((w * 9) / 16)
const left = Math.round((cm.width - w) * 0.55)
const top = Math.round((cm.height - h) * 0.7)
await sharp(clean).extract({ left, top, width: w, height: h }).resize(1920, 1080).jpeg(out).toFile(path.join(dir, 'kitchen-end-clean-1080.jpg'))
console.log('key frames written to', dir)
