import { useRef, useState } from 'react'
import { preload } from 'react-dom'
import { useGSAP } from '@gsap/react'
import { Check } from 'lucide-react'
import { gsap } from '../../animations/gsap'
import { createFrameSequence } from '../../animations/frameSequence'
import { piecewise } from '../../utils/math'
import { heroCopy as copy } from '../../data/heroCopy'
import { heroSequence } from '../../data/heroSequence'
import SplitWords from '../../components/ui/SplitWords'
import Button from '../../components/ui/Button'
import './hero.css'

/**
 * Pinned, scroll-scrubbed transformation.
 *
 * One GSAP timeline of length 1 == scroll progress 0..1 across the pin:
 *   - a linear tween drives the frame-sequence position (via heroSequence.timeMap)
 *   - text acts, progress rail, cue and light sweep sit on the same timeline at the
 *     positions in heroSequence.beats
 * so forward and reverse scrolling are exactly symmetric and nothing needs per-frame
 * bookkeeping. `scrub: 0.6` is the smoothing; there is no rAF loop of our own, and the
 * canvas only repaints when the blended frame pair actually changes.
 */
export default function ScrollHero({ variant, onFail }) {
  const wrapRef = useRef(null)
  const stRef = useRef(null)
  const [ready, setReady] = useState(false)
  const cfg = heroSequence[variant]
  const { beats } = heroSequence

  // First frame is the LCP image: tell the browser early (React hoists this into <head>).
  preload(cfg.frames[0], { as: 'image', fetchPriority: 'high' })

  useGSAP(
    () => {
      const root = wrapRef.current
      const stage = root.querySelector('.hero-stage')
      const canvas = root.querySelector('.hero-canvas')
      const $ = (sel) => root.querySelectorAll(sel)

      const seq = createFrameSequence({
        urls: cfg.frames,
        canvas,
        maxPixels: cfg.maxPixels,
        onFirstFrame: () => setReady(true),
        onError: () => onFail?.(),
      })
      if (import.meta.env.DEV) window.__heroSeq = seq // QA hook (waits for loadedCount === frameCount)

      const state = { p: 0 }
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: `+=${Math.round(cfg.scrollScreens * 100)}%`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const flag = String(self.progress >= beats.act3.ctaLive)
            if (stage.dataset.live !== flag) stage.dataset.live = flag // delta-gated DOM write
          },
        },
      })
      stRef.current = tl.scrollTrigger

      // 1) The room. Linear over the whole pin; timeMap shapes it.
      tl.to(
        state,
        {
          p: 1,
          duration: 1,
          onUpdate: () => seq.draw(piecewise(heroSequence.timeMap, state.p)),
        },
        0,
      )

      // 2) Act 1: "Life Gets Messy."  exits like dust lifting.
      const a1 = beats.act1
      tl.to($('.hero-band-1 .hero-body'), { opacity: 0, y: -18, duration: 0.05 }, a1.bodyOut)
      tl.to($('.hero-band-1 .word'), { yPercent: -115, duration: 0.05, stagger: 0.008, ease: 'power2.in' }, a1.wordsOut)
      tl.to($('.hero-band-1'), { opacity: 0, duration: 0.03 }, a1.bandOut)
      tl.to($('.hero-cue'), { opacity: 0, duration: 0.05 }, beats.cueOut)

      // 3) Act 2: "We Make It Beautiful Again."  rises as the clutter lifts.
      const a2 = beats.act2
      const w2 = $('.hero-band-2 .word')
      tl.fromTo($('.hero-band-2'), { opacity: 0 }, { opacity: 1, duration: 0.04 }, a2.in)
      tl.fromTo(w2, { yPercent: 118 }, { yPercent: 0, duration: 0.1, stagger: 0.013, ease: 'power3.out' }, a2.in)
      tl.to(w2, { yPercent: -118, duration: 0.05, stagger: 0.008, ease: 'power2.in' }, a2.out)
      tl.to($('.hero-band-2'), { opacity: 0, duration: 0.03 }, a2.bandOut)

      // 4) Progress rail: a four-line checklist ticked off at the brief's milestones.
      tl.fromTo($('.hero-rail'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.04 }, beats.rail.in)
      copy.milestones.forEach((m, i) => {
        const at = m.at - 0.02
        const item = `.hero-rail li:nth-child(${i + 1})`
        tl.to($(item), { opacity: 1, duration: 0.03 }, at)
        tl.to($(`${item} .rail-dot > i`), { scale: 1, duration: 0.03, ease: 'back.out(2)' }, at)
        tl.to($(`${item} .rail-dot svg`), { opacity: 1, duration: 0.02 }, at + 0.015)
      })
      tl.to($('.hero-rail'), { opacity: 0, y: -10, duration: 0.04 }, beats.rail.out)

      // 5) The polish pass: a single soft light sweep as the room brightens.
      tl.fromTo($('.hero-gleam'), { x: '-60vw', opacity: 0 }, { x: '150vw', duration: 0.26, ease: 'power1.inOut' }, beats.gleam.in)
      tl.to($('.hero-gleam'), { opacity: 0.9, duration: 0.07 }, beats.gleam.in)
      tl.to($('.hero-gleam'), { opacity: 0, duration: 0.08 }, beats.gleam.out)

      // 6) Act 3: "Come Home to Clean."  the reveal, then CTAs, then a long hold.
      const a3 = beats.act3
      tl.fromTo($('.hero-band-3'), { opacity: 0 }, { opacity: 1, duration: 0.04 }, a3.in)
      tl.fromTo(
        $('.hero-band-3 .word'),
        { yPercent: 118 },
        { yPercent: 0, duration: 0.09, stagger: 0.014, ease: 'power3.out' },
        a3.in,
      )
      tl.fromTo(
        $('.hero-band-3 .hero-body'),
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.06, ease: 'power2.out' },
        a3.body,
      )
      tl.fromTo(
        $('.hero-band-3 .hero-cta > *'),
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.05, stagger: 0.02, ease: 'power2.out' },
        a3.cta,
      )

      // No extra ScrollTrigger.refresh() on font load: pin geometry is the stage (100svh) plus a
      // percentage of it, independent of text metrics, and ScrollTrigger already refreshes on
      // window load. (An extra refresh was a 150ms forced-layout long task under 4x throttle.)
      return () => {
        stRef.current = null
        seq.destroy()
      }
    },
    { scope: wrapRef, dependencies: [variant], revertOnUpdate: true },
  )

  // Keyboard users tabbing to Act 3's CTAs: bring the hero to its final state first.
  const onCtaFocus = () => {
    const st = stRef.current
    if (st && st.progress < beats.act3.ctaLive) window.scrollTo({ top: st.end, behavior: 'auto' })
  }

  const skip = (e) => {
    e.preventDefault()
    const target = document.getElementById('after-hero')
    if (target) {
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY, behavior: 'auto' })
      target.focus({ preventScroll: true })
    }
  }

  return (
    // The wrapper is what React owns; ScrollTrigger's pin-spacer lives inside it,
    // so unmounting can never hit "removeChild" on a node GSAP re-parented.
    <div ref={wrapRef}>
      <section
        className="hero-stage"
        data-ready={ready}
        data-live="false"
        data-variant={variant}
        data-text-side={heroSequence.textSide}
        style={{
          '--hero-copy-w': heroSequence.copyLayout?.width,
          '--hero-h-size': heroSequence.copyLayout?.headlineSize,
          '--hero-body-w': heroSequence.copyLayout?.bodyWidth,
        }}
      >
        <a className="hero-skip" href="#after-hero" onClick={skip}>
          Skip the cleaning animation
        </a>

        <img
          className="hero-poster"
          src={cfg.frames[0]}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          decoding="async"
        />
        <canvas
          className="hero-canvas"
          role="img"
          aria-label="A modern living room that goes from messy to spotless as you scroll"
        />
        <div className="hero-gleam" aria-hidden="true" />

        <div className="hero-copy">
          {/* Act 1 */}
          <div className="hero-band hero-band-1">
            <div className="hero-text">
              <SplitWords as="p" className="hero-h" text={copy.act1.headline} intro />
              <p className="hero-body">{copy.act1.body}</p>
            </div>
          </div>

          {/* Act 2 */}
          <div className="hero-band hero-band-2" style={{ opacity: 0 }}>
            <div className="hero-text">
              <SplitWords
                as="p"
                className="hero-h"
                text={copy.act2.headline}
                emphasis={copy.act2.emphasis}
              />
            </div>
          </div>

          {/* Act 3: the page's h1 (earlier acts are paragraphs so there is one h1) */}
          <div className="hero-band hero-band-3" style={{ opacity: 0 }}>
            <div className="hero-text">
              <SplitWords as="h1" className="hero-h" text={copy.act3.headline} />
              <p className="hero-body">{copy.act3.body}</p>
            </div>
            <div className="hero-cta" onFocusCapture={onCtaFocus}>
              <Button to={copy.act3.primary.to} arrow>
                {copy.act3.primary.label}
              </Button>
              <Button to={copy.act3.secondary.to} variant="secondaryOnPhoto">
                {copy.act3.secondary.label}
              </Button>
            </div>
          </div>
        </div>

        {/* progress rail (decorative: the story is told by the headlines) */}
        <div className="hero-rail" aria-hidden="true">
          <h2>Cleaning progress</h2>
          <ol>
            {copy.milestones.map((m) => (
              <li key={m.label}>
                <span className="rail-dot">
                  <i />
                  <Check strokeWidth={3} />
                </span>
                {m.label}
              </li>
            ))}
          </ol>
        </div>

        <div className="hero-cue" aria-hidden="true">
          <span>{copy.act1.cue}</span>
          <i />
        </div>

        {heroSequence.isPlaceholder && (
          <p className="hero-badge" role="note">
            <b>Prototype</b> · {heroSequence.placeholderNote}
          </p>
        )}
      </section>
    </div>
  )
}
