# Higgsfield Production Guide: the "Chaos to Calm" hero

> **Status:** Higgsfield was **not connected** when this was written, so **no real hero
> assets have been generated.** The site currently runs on clearly-labelled prototype
> frames (`scripts/make-prototype-frames.mjs`). This guide is everything needed to produce
> the real set, in the order to do it, with exact prompts, specs, filenames and checks.
> If you connect Higgsfield to Claude Code, the whole workflow below can be run for you.

---

## 0. The one decision that makes or breaks this hero

The hero shows **one room changing state** as you scroll. In AI video, "turn this thing
into a different thing" is the hardest shot there is (furniture morphs, walls drift,
objects pop in). So we do **not** ask a video model to clean a room in one clip.

**Recommended pipeline (state images, then interpolation):**

1. One **master image** fixes the room: camera, lens, architecture, furniture, light.
2. Every other state is an **image edit of the master** (same camera, same room), changing
   *only* clutter, cushions, stains, dust, floor shine and light warmth.
3. Seven state images are approved by eye, then **interpolated into 60 to 120 frames**
   (ffmpeg, or short image-to-video between neighbouring states for the biggest gaps).
4. The site blends the two nearest frames on a canvas, so motion is continuous.

Why not one long video? A video model gets no guarantee that the sofa in second 5 is the
sofa in second 1. State images edited from one master do, and each one is a cheap, gated,
re-rollable asset (the skill's "video gate" idea applied per state).

If you still want a generated video for any transition, use **first-frame + last-frame
image-to-video between two adjacent approved states**, never the whole 0% to 100% span.

---

## 1. Asset specs

| Asset | Desktop | Mobile |
|---|---|---|
| Aspect ratio | 16:9 | 9:16 |
| Master / state stills | 2560 x 1440 (generate high, export down) | 1440 x 2560 |
| **Delivered frames** | **1920 x 1080 WebP**, q 70 to 78 | **720 x 1280 WebP** (up to 828 x 1472), q 68 to 74 |
| Frame count | 60 to 120 | 24 to 36 |
| Target weight / frame | under 70 KB (hard cap 120 KB) | under 35 KB |
| Naming | `frame-001.webp` ... `frame-NNN.webp` (zero-padded, dirty to clean) | same |
| Location | `src/assets/images/hero/desktop/` | `src/assets/images/hero/mobile/` |
| Static / social images | `hero-clean-static.webp` (1920 x 1080), `og-share.jpg` (1200 x 630) | |

Totals to aim for: desktop sequence **under 6 MB**, mobile **under 1.2 MB**. Frame 1 (the
messy room) is the LCP image: keep it **under 90 KB**.

### Mobile is a *different crop*, not a squashed desktop frame

Generate the mobile set from the **same master** with a vertical re-frame (or an outpainted
taller image). The 9:16 frame must keep:

- the **sofa and coffee table** in the lower-middle (roughly 45% to 75% of the height),
- **empty wall / ceiling in the top 40%** (headline + paragraph live here),
- a clean floor band in the bottom 20% (CTAs live here in the final act).

### Text-safe zones (all frames)

Dark forest-green text sits on the wall, so the wall must stay **light, calm and low
detail** in these zones in *every* state (the audit script checks contrast):

- Desktop: left 55% x top 12% to 58% of the frame. Keep it plain wall. No lamps, tall
  plants, shelves, or art here.
- Mobile: top 40% of the frame.

---

## 2. Asset naming for the generation stage

Work files (keep **outside** `src/`, e.g. `review/` next to the project):

```
review/hero/
  master-room-v1.png            # approved master
  state-0-messy.png             # 0 %
  state-1-clutter-lifting.png   # 25 %
  state-2-cushions.png          # 40 %
  state-3-surfaces.png          # 50 %
  state-4-floors.png            # 65 %
  state-5-almost.png            # 80 %
  state-6-pristine.png          # 100 %
  mobile/ (same names, 9:16)
```

Only the exported `frame-NNN.webp` files go into `src/assets/`.

---

## 2b. DECIDED: the master is a real photograph (Pexels photo 37760269)

The master is **not** generated. It is a real photograph of a real home (free Pexels licence, no
attribution required, edits allowed; it carries no model or property release, which is normal for
stock). Saved at `review/hero/master-photo-L12.jpg` (2560 x 1707, 584 KB). Everything else is an
**edit of that one photo**, so the room, camera and light stay identical:

1. **Clean state = the photo itself** (it is already tidy and bright).
2. **Make room for the headline (optional but recommended):** ask Higgsfield to extend the canvas
   upward by about 20% (more plain white ceiling) so the 16:9 crop keeps the whole rug and floor
   while the headline sits on calm ceiling. Prompt: *"Extend this photograph upward by about 20%,
   continuing the plain white ceiling and the crown moulding exactly. Do not change anything else."*
3. **Dirty state:** edit the photo (prompt in 3.2) keeping the sofa, armchairs, glass coffee table,
   floor lamp, framed art, rug and window exactly where they are.
4. **In-between states** (3.4): edit from the clean photo each time, never from a previous state.
5. **Mobile:** a 9:16 re-frame of the same states, taking the sofa side (the ceiling and wall are the
   free zone for the headline, the rug is the free zone for the buttons).

Room-specific details to name in the edit prompts: grey three-seat sofa with two dark-green and one
blue patterned cushion, two grey-and-walnut armchairs (one with a green knitted throw and tan leather
cushion), triangular glass-and-walnut coffee table with a bowl of moss balls, tall window with white
blinds, two brass floor lamps, large abstract framed print on the right wall, blue-grey abstract rug,
honey hardwood floor.

Until those states exist the hero runs on **interim lighting-only frames** derived from the same photo
(`scripts/make-interim-frames-from-photo.mjs`): dusty, dim and hazy becoming bright. There is no clutter
in those frames, so "Life Gets Messy" is represented by dull light and dust only.

---

## 3. Prompts

General rules for **every** prompt (from the skill's laws): fixed tripod camera; identical
architecture and furniture in every state; photorealistic interior photography; *"no text,
no logos, no lettering anywhere"*; describe calm areas as *part of the room* ("a plain
sunlit wall") never as "empty space/darkness"; decline any preset the tool suggests and
retry with the literal prompt.

### 3.1 Master reference image (16:9, 2K to 4K, still)

```
Wide-angle architectural interior photograph of a luxurious modern living room, shot from
a fixed tripod at eye level, 24mm lens, one-point perspective. A large floor-to-ceiling
window on the right wall fills the room with warm natural sunlight and soft shadows. A
cream bouclé three-seat sofa sits against the back wall right of centre, with four
cushions in sage green, deep forest green and oat. In front of it: an elegant low oak
coffee table on a textured oat-and-sage rug, polished honey-oak herringbone floor. A large
indoor plant stands by the window; a low walnut console is at the far left. The left half
of the back wall is one calm, plain, light warm-white wall with generous breathing room
and no objects. Soft, high-end Scandinavian-meets-organic styling, restrained palette of
cream, oak, sage and forest green. Photorealistic, natural light, premium real-estate
photography. No text, no logos, no lettering anywhere.
```

**Approve only if:** the left wall is genuinely empty and light, the sofa is centred in the
right 60%, nothing tall competes with the headline zone, and there are no brand marks.

### 3.2 Dirty version (image edit of the master; keep camera)

Use the master as the **reference / edit source** and keep the strength low enough that
geometry survives. Prompt:

```
Edit this exact photograph: keep the identical camera angle, lens, room architecture, window
positions, sofa, coffee table, rug, console and plants in exactly the same places. Change
ONLY cleanliness and organisation: the room looks realistically lived-in and messy, not
destroyed. Cushions slumped and scattered, one on the floor; a crumpled grey throw
blanket hanging off the sofa arm; a cluttered coffee table with two mugs, a plate with
crumbs, a stack of magazines and a remote; sneakers, toy blocks and loose papers on the
floor; a few faint stains on the rug and sofa seat; a thin layer of dust on surfaces; a
slightly crooked framed picture on the wall; smudged window glass. Dull, slightly overcast
natural lighting, muted and desaturated. The left wall stays plain and uncluttered.
Photorealistic. No text, no logos, no lettering anywhere.
```

### 3.3 Clean version (image edit of the master)

```
Edit this exact photograph: keep the identical camera angle, lens, architecture, window
positions and all furniture in exactly the same places. Change ONLY cleanliness: the room
is pristine and beautifully organised. Cushions plumped and symmetrically arranged on the
sofa, a neatly folded throw on the sofa arm, the coffee table styled with a small vase of
fresh greenery, two stacked books and a candle, spotless rug, gleaming polished wooden
floor with soft window reflections, crystal-clear window glass, warm golden sunlight
flooding the room, vibrant healthy plants, a few subtle highlights on polished surfaces.
Bright, airy, peaceful and luxurious. The left wall stays plain and light. Photorealistic.
No text, no logos, no lettering anywhere.
```

### 3.4 Intermediate states (each an edit of the **clean** master, going backwards)

Always edit from the **master/clean image**, not from the previous state, so errors do not
compound. Replace the bracket each time. Keep the first paragraph identical.

```
Edit this exact photograph: keep the identical camera, architecture and furniture
positions. Show the room at an intermediate point of being cleaned: [STATE]. Everything
not mentioned is fully clean and tidy. Lighting [LIGHT]. Photorealistic, no text, no
logos, no lettering anywhere.
```

| State | Scroll | `[STATE]` | `[LIGHT]` |
|---|---|---|---|
| 1 | 25 % | floor clutter gone; table still has mugs, plate and magazines; cushions still slumped; stains and dust still present | dull, overcast, desaturated |
| 2 | 40 % | cushions arranged neatly; table partly cleared (one mug left); faint stains; light dust on surfaces | slightly brighter, a little warmth |
| 3 | 50 % | table styled and clean; sofa and surfaces clean; floor still a little dull; faint rug stains fading | soft daylight |
| 4 | 65 % | floors spotless and starting to shine; rug clean; all surfaces clean; window slightly hazy | bright, clearer sun |
| 5 | 80 % | almost pristine; polished floor; window clear; no sparkle yet | warm, golden |
| 6 | 100 % | = the clean version of 3.3 plus a few tasteful glints | warm, golden, airy |

### 3.5 Consistency review (do before interpolating)

Flip between states at the same zoom, or stack them as layers at 50% opacity. Reject any
state where: the window moved, the sofa changed shape, the plant changed species, the rug
pattern changed, the floor plank direction changed, or lighting flickers *sideways* (a
shift in light direction, as opposed to brightness). Re-roll that state only.

### 3.6 Video prompt (optional, **adjacent states only**)

Use image-to-video with **start = state N, end = state N+1** (if the model supports an end
frame). Never ask for the whole transformation in one clip.

```
Ultra-photorealistic luxury modern living room cleaning transformation, fixed tripod camera,
identical architecture and furniture throughout, natural daylight, cinematic interior
photography, a realistic messy living room gradually becoming immaculately clean, clutter
disappearing naturally, surfaces becoming polished, cushions becoming organized, floors
becoming spotless, warm sunlight filling the room, smooth progressive transformation,
premium architectural photography, realistic materials, consistent perspective, no camera
movement, no furniture morphing, no scene cuts, no flickering, no text, no logos.
```

Settings: 1080p, 5 to 6 s, standard mode, no audio, 16:9 and a separate 9:16 run. Run the
gate on each clip: extract first / middle / last frames, check anatomy of objects and that
the end frame matches the next state. If a clip fails 3 times, change the concept (use pure
interpolation for that gap) rather than re-rolling.

---

## 4. Turning approved states into frames

Requires ffmpeg (`winget install ffmpeg` on Windows). **Untested here:** ffmpeg was not installed on the build machine, so these commands are adapted from the 10k-websites skill recipes and have not been run. Check each output before relying on it.

**A. Crossfade interpolation** (cheapest, robust; the site's canvas blend also helps):

```bash
# 7 states -> ~90 frames. Each state holds 1 frame; blend between neighbours.
ffmpeg -framerate 1/1 -i review/hero/seq/state-%d.png \
  -vf "minterpolate=fps=15:mi_mode=blend,scale=1920:1080" -c:v png review/hero/frames/f-%04d.png
```

**B. Motion interpolation** (smoother object motion, can introduce warping, so review):
use `mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1` or an AI interpolator (RIFE) between
each pair. Prefer **A** unless objects visibly "pop".

**C. Export to WebP** (desktop):

```bash
ffmpeg -i review/hero/frames/f-%04d.png -vf scale=1920:-2 -c:v libwebp -quality 74 \
  src/assets/images/hero/desktop/frame-%03d.webp
```

(mobile: `scale=720:-2`, `-quality 70`). If sizes exceed the targets in section 1, lower the
quality step by step and check the **calm gradient frames** first (banding shows there).

Then in `src/data/heroSequence.js`:

1. Set `isPlaceholder: false` (removes the "Prototype art" badge).
2. Tune `timeMap` so the milestones land where the copy says: clutter lifting from about
   25 %, cushions straight by about 40 %, surfaces at about 50 %, floors spotless by about
   65 %, almost done at about 75 %, final frame held from about 90 %.
3. Delete `src/assets/images/hero/README.md` (it says the frames are prototypes).

---

## 5. Verify before launch

```bash
npm run dev                      # terminal 1
node scripts/qa/hero-shots.mjs ./review/shots 1440 900 0   # screenshots at 11 scroll points
node scripts/qa/hero-shots.mjs ./review/shots-m 390 844 1  # mobile
```

and run the contrast audit (`scripts/qa/hero-contrast.mjs`) so every headline / paragraph
meets 4.5:1 (body) and 3:1 (large) over the **worst** frame of its band. Real photographic
walls are busier than the prototype art, so expect to tune the scrim in
`src/sections/Hero/hero.css` (`.hero-band::before`).

## 6. What can and cannot be done from here

| Task | Directly by Claude Code | Needs you |
|---|---|---|
| Write prompts, specs, filenames, ffmpeg recipes | yes | |
| Generate stills / video | only with the Higgsfield connector connected | connect it (below) |
| Install ffmpeg | yes, once you approve | |
| Judge consistency of renders | yes (reviews screenshots) | final taste call |
| Replace prototype frames + retune `timeMap` | yes | |

**Connecting Higgsfield (one-time, only you can click these):** in Claude Code open
*Connectors, Manage connectors, Add custom connector*, name it `Higgsfield`, URL
`https://mcp.higgsfield.ai/mcp`, then *Connect* and sign in/allow in the browser window that
opens. Credits and plans are on higgsfield.ai; every generation can be price-checked for free
before it is run.
