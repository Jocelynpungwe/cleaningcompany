/**
 * PROTOTYPE ARTWORK GENERATOR
 * ---------------------------------------------------------------------------
 * Draws a stylised living room as a messy -> clean frame sequence so the scroll
 * engine can be built and tested BEFORE the real Higgsfield renders exist.
 *
 * This is NOT final artwork. Replace the files it writes with the real matching
 * frames (see docs/higgsfield-production-guide.md) and set `isPlaceholder: false`
 * in src/data/heroSequence.js.
 *
 * Usage:
 *   node scripts/make-prototype-frames.mjs              # desktop + mobile
 *   node scripts/make-prototype-frames.mjs desktop      # one variant
 *   node scripts/make-prototype-frames.mjs preview      # 5 PNG previews to ./.preview
 *
 * Milestones (scroll progress t, matching the brief):
 *   .22-.50 floor clutter leaves        .35-.60 cushions straighten
 *   .30-.50 table clutter leaves        .45-.68 stains + dust lift
 *   .50-.85 room brightens, floor shines   .60-1.0 sparkles settle
 */
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'src/assets/images/hero');

const VARIANTS = {
  // viewBox crops of the same scene. Mobile is a tall crop centred on the sofa,
  // with extra wall above (text-safe) and extra floor below.
  desktop: { vb: { x: 0, y: 0, w: 1920, h: 1080 }, px: [1920, 1080], count: 60, q: 74 },
  mobile: { vb: { x: 420, y: -650, w: 1160, h: 2062 }, px: [720, 1280], count: 30, q: 72 },
};

/* ------------------------------------------------------------- helpers -- */
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ss = (x) => x * x * (3 - 2 * x);
const seg = (t, a, b) => ss(clamp01((t - a) / (b - a)));
const lerp = (a, b, k) => a + (b - a) * k;
const rng = (seed) => {
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
};
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, k) => {
  const A = hex(a);
  const B = hex(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], k)).toString(16).padStart(2, '0')).join('');
};
const f = (n) => Math.round(n * 10) / 10;

/* --------------------------------------------------------------- floor -- */
function floorLayer() {
  const r = rng(11);
  const vp = { x: 1000, y: -500 };
  const yTop = 720;
  const yBot = 1700;
  const k = (yTop - vp.y) / (yBot - vp.y);
  const tones = ['#C8A078', '#BF9670', '#CFA982', '#C39B74', '#CBA47C'];
  let out = '';
  const xs = [];
  for (let i = -16; i <= 20; i++) xs.push(i * 170 + (r() * 16 - 8));
  for (let i = 0; i < xs.length - 1; i++) {
    const b0 = xs[i];
    const b1 = xs[i + 1];
    const t0 = vp.x + (b0 - vp.x) * k;
    const t1 = vp.x + (b1 - vp.x) * k;
    out += `<polygon points="${f(t0)},${yTop} ${f(t1)},${yTop} ${b1},${yBot} ${b0},${yBot}" fill="${tones[Math.floor(r() * tones.length)]}"/>`;
    const seams = 2 + Math.floor(r() * 3);
    for (let s = 0; s < seams; s++) {
      const u = Math.pow(r(), 1.5);
      const y = yTop + (yBot - yTop) * u;
      const xl = t0 + (b0 - t0) * u;
      const xr = t1 + (b1 - t1) * u;
      out += `<line x1="${f(xl)}" y1="${f(y)}" x2="${f(xr)}" y2="${f(y)}" stroke="#5a3d22" stroke-opacity=".22" stroke-width="${f(1 + u * 2)}"/>`;
    }
    out += `<line x1="${f(t0)}" y1="${yTop}" x2="${b0}" y2="${yBot}" stroke="#5a3d22" stroke-opacity=".28" stroke-width="1.6"/>`;
  }
  return out;
}

/* ---------------------------------------------------------- scene (t) --- */
function scene(t, variantKey) {
  const { vb } = VARIANTS[variantKey];

  // progress windows ---------------------------------------------------------
  const pFloorA = seg(t, 0.22, 0.38); // first clutter pieces
  const pFloorB = seg(t, 0.3, 0.5);
  const pFloorC = seg(t, 0.36, 0.52);
  const pTable = seg(t, 0.3, 0.5);
  const pTableNew = seg(t, 0.46, 0.64);
  const pThrowOut = seg(t, 0.25, 0.45);
  const pThrowIn = seg(t, 0.46, 0.62);
  const pStain = seg(t, 0.45, 0.68);
  const pDust = seg(t, 0.15, 0.75);
  const pSurfaceDust = seg(t, 0.35, 0.6);
  const pSmudge = seg(t, 0.38, 0.6);
  const pArt = seg(t, 0.3, 0.5);
  const pGrade = seg(t, 0.35, 0.9);
  const pLight = seg(t, 0.5, 0.9);
  const pPolish = seg(t, 0.5, 0.8);
  const pSparkle = seg(t, 0.6, 0.82);
  const pPlant = seg(t, 0.4, 0.7);

  const sat = lerp(0.58, 1.05, pGrade);
  const bright = lerp(0.84, 1.03, pGrade);

  /* colours */
  const sofa = '#E8E0D0';
  const sofaShade = '#D3C9B5';
  const sage = '#78B89A';
  const forest = '#2C5F4F';
  const oat = '#E3D8C2';
  const walnut = '#6E5038';

  /* ---- cushions: messy pose -> tidy pose ---- */
  const cushions = [
    { c: sage, w: 150, h: 150, m: { x: 880, y: 625, r: -30 }, n: { x: 810, y: 540, r: -4 } },
    { c: oat, w: 130, h: 130, m: { x: 760, y: 880, r: 42 }, n: { x: 880, y: 556, r: 7 } },
    { c: forest, w: 150, h: 150, m: { x: 1255, y: 650, r: 24 }, n: { x: 1390, y: 540, r: 4 } },
    { c: sage, w: 130, h: 130, m: { x: 1030, y: 920, r: -18 }, n: { x: 1320, y: 556, r: -7 } },
  ]
    .map((q, i) => {
      const kk = seg(t, 0.35 + i * 0.03, 0.57 + i * 0.03);
      const x = lerp(q.m.x, q.n.x, kk);
      const y = lerp(q.m.y, q.n.y, kk) - Math.sin(kk * Math.PI) * 50; // hop
      const r = lerp(q.m.r, q.n.r, kk);
      const sq = 1 - 0.1 * (1 - kk); // slumped cushions look flatter
      return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(r)}) scale(1 ${f(sq)})">
        <rect x="${-q.w / 2}" y="${-q.h / 2}" width="${q.w}" height="${q.h}" rx="${q.w * 0.26}" fill="${q.c}"/>
        <rect x="${-q.w / 2}" y="${-q.h / 2}" width="${q.w}" height="${q.h}" rx="${q.w * 0.26}" fill="url(#cushShade)"/>
        <path d="M ${-q.w / 2 + 14} ${-q.h / 2 + 18} Q 0 ${-q.h / 2 + 4} ${q.w / 2 - 14} ${-q.h / 2 + 18}" stroke="#fff" stroke-opacity=".35" stroke-width="3" fill="none"/>
      </g>`;
    })
    .join('');

  /* ---- floor clutter (each leaves on its own window) ---- */
  const gone = (k) => 1 - k;
  const floorClutter = `
    <g opacity="${f(gone(pFloorA))}" transform="translate(0 ${f(-pFloorA * 18)})">
      <g transform="translate(740 944) rotate(-14)"><rect x="-44" y="-14" width="88" height="28" rx="14" fill="#33413b"/><rect x="-44" y="6" width="88" height="8" rx="4" fill="#e9e6df"/></g>
      <g transform="translate(838 972) rotate(22)"><rect x="-44" y="-14" width="88" height="28" rx="14" fill="#3a4a43"/><rect x="-44" y="6" width="88" height="8" rx="4" fill="#e9e6df"/></g>
    </g>
    <g opacity="${f(gone(pFloorB))}" transform="translate(0 ${f(-pFloorB * 18)})">
      <rect x="1040" y="948" width="36" height="36" rx="4" fill="#d96b5f" transform="rotate(14 1058 966)"/>
      <rect x="1086" y="972" width="32" height="32" rx="4" fill="#e6b84f" transform="rotate(-20 1102 988)"/>
      <rect x="1006" y="990" width="30" height="30" rx="4" fill="#5f8fc4" transform="rotate(32 1021 1005)"/>
      <rect x="1250" y="930" width="84" height="58" fill="#fbfaf6" stroke="#cfcabd" transform="rotate(-12 1292 960)"/>
      <rect x="1196" y="990" width="84" height="58" fill="#f4f1e8" stroke="#cfcabd" transform="rotate(18 1238 1019)"/>
      <rect x="1330" y="1010" width="84" height="58" fill="#fbfaf6" stroke="#cfcabd" transform="rotate(-30 1372 1039)"/>
    </g>
    <g opacity="${f(gone(pFloorC))}" transform="translate(0 ${f(-pFloorC * 18)})">
      <path d="M 930 1000 q 24 -34 52 -6 q 8 20 -14 26 q -32 8 -38 -20 z" fill="#8d7ba8"/>
      <g transform="translate(1500 912) rotate(-8)">
        <path d="M -52 0 L -40 -78 L 40 -78 L 52 0 Z" fill="#c98f5a"/>
        <path d="M -26 -78 q 0 -34 26 -34 q 26 0 26 34" fill="none" stroke="#a9733f" stroke-width="7"/>
        <path d="M -46 -30 L 46 -30" stroke="#a9733f" stroke-opacity=".5" stroke-width="3"/>
      </g>
      <circle cx="1120" cy="1030" r="3" fill="#6b5a45"/><circle cx="1138" cy="1042" r="2.5" fill="#6b5a45"/><circle cx="880" cy="880" r="3" fill="#6b5a45"/>
      <circle cx="1440" cy="975" r="3" fill="#6b5a45"/><circle cx="1060" cy="905" r="2.5" fill="#6b5a45"/>
    </g>`;

  /* ---- coffee table + contents ---- */
  const tableX = 900;
  const tableY = 812;
  const tableContentsMessy = `
    <g opacity="${f(gone(pTable))}" transform="translate(0 ${f(-pTable * 14)})">
      <g transform="translate(1000 ${tableY - 2}) rotate(-6)">
        <rect x="-62" y="-14" width="124" height="12" fill="#c9d4cc"/><rect x="-58" y="-26" width="116" height="12" fill="#d8c4c0"/><rect x="-64" y="-38" width="120" height="12" fill="#e2d9a8"/>
      </g>
      <g transform="translate(1110 ${tableY - 2})"><rect x="-22" y="-32" width="44" height="32" rx="6" fill="#fff"/><path d="M 22 -24 q 18 0 14 12 q -3 8 -14 6" fill="none" stroke="#fff" stroke-width="5"/><ellipse cx="0" cy="-30" rx="20" ry="5" fill="#6b4a2f"/></g>
      <g transform="translate(1196 ${tableY - 2})"><rect x="-20" y="-28" width="40" height="28" rx="6" fill="#d8e3f0"/><ellipse cx="0" cy="-27" rx="18" ry="4.5" fill="#5b3d28"/></g>
      <g transform="translate(1290 ${tableY - 3})"><ellipse cx="0" cy="0" rx="46" ry="9" fill="#fafaf6" stroke="#d9d4c6"/><circle cx="-14" cy="-3" r="2.5" fill="#a98b5e"/><circle cx="6" cy="-1" r="2" fill="#a98b5e"/><circle cx="18" cy="-4" r="2.4" fill="#a98b5e"/></g>
      <rect x="1346" y="${tableY - 12}" width="64" height="12" rx="3" fill="#2a2f2e" transform="rotate(-9 1378 ${tableY - 6})"/>
      <path d="M 940 ${tableY - 4} q 12 -18 26 -4 q -4 14 -20 8 z" fill="#efe9dd" stroke="#cfc8b7"/>
    </g>`;
  const tableContentsClean = `
    <g opacity="${f(pTableNew)}" transform="translate(0 ${f((1 - pTableNew) * 10)})">
      <g transform="translate(1000 ${tableY - 2})"><rect x="-70" y="-16" width="140" height="16" fill="#E8E1D2"/><rect x="-62" y="-30" width="124" height="14" fill="#2C5F4F"/><rect x="-54" y="-42" width="108" height="12" fill="#F4EFE4" stroke="#d6cfbf"/></g>
      <g transform="translate(1180 ${tableY - 2})">
        <path d="M -22 0 q -8 -50 10 -78 h 24 q 18 28 10 78 z" fill="#F3EFE6" stroke="#d9d2c2"/>
        <path d="M 0 -78 q -30 -60 -52 -90 M 0 -78 q 4 -80 8 -118 M 0 -78 q 34 -50 62 -84 M 0 -78 q -14 -54 -22 -100" stroke="#4d8a6c" stroke-width="3" fill="none"/>
        <ellipse cx="-52" cy="-168" rx="16" ry="8" fill="#78B89A" transform="rotate(-38 -52 -168)"/><ellipse cx="8" cy="-196" rx="16" ry="8" fill="#5fa583" transform="rotate(80 8 -196)"/>
        <ellipse cx="62" cy="-164" rx="16" ry="8" fill="#78B89A" transform="rotate(38 62 -164)"/><ellipse cx="-22" cy="-180" rx="14" ry="7" fill="#5fa583" transform="rotate(-70 -22 -180)"/>
        <circle cx="-10" cy="-150" r="8" fill="#fbfaf6"/><circle cx="26" cy="-138" r="7" fill="#fbfaf6"/><circle cx="-34" cy="-124" r="7" fill="#fbfaf6"/>
      </g>
      <g transform="translate(1320 ${tableY - 2})"><ellipse cx="0" cy="-2" rx="38" ry="8" fill="#D9CFBA"/><rect x="-26" y="-30" width="52" height="28" rx="8" fill="#F5F1E8" stroke="#d9d2c2"/><ellipse cx="0" cy="-30" rx="26" ry="6" fill="#EDE7DA"/></g>
    </g>`;

  /* ---- throw blanket ---- */
  const throwMessy = `
    <g opacity="${f(gone(pThrowOut))}">
      <path d="M 1450 520 q 60 -10 70 50 q 8 90 -10 190 q -40 20 -86 -4 q 20 -60 -4 -110 q -22 -50 30 -126 z" fill="#b8a9a0"/>
      <path d="M 1466 560 q 20 40 12 100 M 1496 590 q 8 50 -2 120" stroke="#8e8078" stroke-opacity=".55" stroke-width="3" fill="none"/>
    </g>`;
  const throwClean = `
    <g opacity="${f(pThrowIn)}" transform="translate(0 ${f((1 - pThrowIn) * -14)})">
      <path d="M 1456 528 q 40 -14 64 8 l 0 120 q -30 14 -64 -2 z" fill="#C8DDD1"/>
      <path d="M 1466 548 l 44 -6 M 1466 574 l 44 -6 M 1466 600 l 44 -6 M 1466 626 l 44 -6" stroke="#2C5F4F" stroke-opacity=".6" stroke-width="5"/>
    </g>`;

  /* ---- sparkles ---- */
  const spark = (x, y, s, a) =>
    `<g transform="translate(${x} ${y}) scale(${f(s)})" opacity="${f(a)}"><path d="M 0 -22 C 2 -6 6 -2 22 0 C 6 2 2 6 0 22 C -2 6 -6 2 -22 0 C -6 -2 -2 -6 0 -22 Z" fill="#fff"/><circle r="26" fill="url(#glint)"/></g>`;
  const sparkles = [
    spark(1070, 808, 0.9, pSparkle * 0.95),
    spark(1380, 806, 0.7, pSparkle * 0.8),
    spark(936, 802, 0.55, pSparkle * 0.7),
    spark(960, 960, 0.8, pSparkle * 0.7),
    spark(1530, 900, 0.65, pSparkle * 0.6),
    spark(1540, 330, 0.7, pSparkle * 0.7),
    spark(700, 560, 0.6, pSparkle * 0.55),
    spark(1190, 440, 0.55, pSparkle * 0.5),
  ].join('');

  /* ---- dust motes in the air (drift away) ---- */
  const r = rng(5);
  let motes = '';
  for (let i = 0; i < 46; i++) {
    const x = vb.x + r() * vb.w;
    const y = vb.y + r() * vb.h * 0.72;
    motes += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(1.2 + r() * 2.6)}" fill="#fff" opacity="${f((0.25 + r() * 0.4) * (1 - pDust))}"/>`;
  }

  /* ------------------------------------------------------------ SVG ------ */
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.x} ${vb.y} ${vb.w} ${vb.h}" width="${vb.w}" height="${vb.h}">
<defs>
  <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4F0E6"/><stop offset="1" stop-color="#E6DFD0"/></linearGradient>
  <radialGradient id="wash" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF6DC" stop-opacity=".95"/><stop offset="1" stop-color="#FFF6DC" stop-opacity="0"/></radialGradient>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFE0F2"/><stop offset=".7" stop-color="#E8F4F7"/><stop offset="1" stop-color="#F6FBF4"/></linearGradient>
  <linearGradient id="floorAO" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b1a0c" stop-opacity=".42"/><stop offset=".22" stop-color="#2b1a0c" stop-opacity="0"/></linearGradient>
  <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity=".1"/></linearGradient>
  <linearGradient id="beam" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF3CF" stop-opacity=".9"/><stop offset="1" stop-color="#FFF3CF" stop-opacity=".05"/></linearGradient>
  <linearGradient id="cushShade" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>
  <linearGradient id="sofaTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".25" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#6e5a3c" stop-opacity=".18"/></linearGradient>
  <radialGradient id="glint"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  <radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#1b1408" stop-opacity="0"/><stop offset="1" stop-color="#1b1408" stop-opacity=".22"/></radialGradient>
  <filter id="b4" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter>
  <filter id="b10" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="10"/></filter>
  <filter id="b26" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="26"/></filter>
  <filter id="grade" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
    <feColorMatrix type="saturate" values="${f(sat * 100) / 100}"/>
    <feComponentTransfer><feFuncR type="linear" slope="${f(bright * 100) / 100}"/><feFuncG type="linear" slope="${f(bright * 100) / 100}"/><feFuncB type="linear" slope="${f(bright * 100) / 100}"/></feComponentTransfer>
  </filter>
  <filter id="speck" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 .55  0 0 0 0 .52  0 0 0 0 .46  0 0 0 2.2 -1.15"/>
  </filter>
  <clipPath id="glass"><rect x="1288" y="88" width="464" height="564"/></clipPath>
</defs>

<g filter="url(#grade)">
  <!-- wall -->
  <rect x="-400" y="-800" width="2800" height="1520" fill="url(#wall)"/>
  <ellipse cx="1330" cy="330" rx="1000" ry="760" fill="url(#wash)" opacity="${f(0.1 + 0.6 * pLight)}"/>
  <!-- window -->
  <g>
    <rect x="1270" y="70" width="500" height="600" fill="#F7F4EE"/>
    <g clip-path="url(#glass)">
      <rect x="1288" y="88" width="464" height="564" fill="url(#sky)"/>
      <ellipse cx="1360" cy="640" rx="170" ry="120" fill="#8DBB9C" filter="url(#b10)"/>
      <ellipse cx="1560" cy="660" rx="200" ry="130" fill="#6FA987" filter="url(#b10)"/>
      <ellipse cx="1690" cy="620" rx="130" ry="100" fill="#9CC8AA" filter="url(#b10)"/>
      <rect x="1288" y="88" width="464" height="564" fill="#8c979d" opacity="${f(0.4 * (1 - pLight))}"/>
      <rect x="1288" y="88" width="464" height="564" fill="#fff" opacity="${f(0.05 + 0.3 * pLight)}"/>
      <g opacity="${f(0.55 * (1 - pSmudge))}" stroke="#fff" stroke-width="16" stroke-linecap="round" fill="none" filter="url(#b4)">
        <path d="M 1320 160 q 40 60 70 40 M 1480 250 q 60 40 120 10 M 1380 420 q 50 -30 90 20 M 1620 150 q 30 70 80 60 M 1560 520 q 60 20 110 -20"/>
      </g>
    </g>
    <rect x="1425" y="88" width="14" height="564" fill="#F7F4EE"/><rect x="1601" y="88" width="14" height="564" fill="#F7F4EE"/>
    <rect x="1288" y="236" width="464" height="14" fill="#F7F4EE"/>
    <rect x="1250" y="668" width="540" height="20" rx="3" fill="#EAE4D8"/>
    <rect x="1250" y="686" width="540" height="12" fill="#2b1a0c" opacity=".12" filter="url(#b4)"/>
    <!-- curtains -->
    <path d="M 1190 -300 H 1292 V 700 H 1190 Z" fill="#E9E1D0"/><path d="M 1210 -300 V 700 M 1238 -300 V 700 M 1266 -300 V 700" stroke="#cfc4ac" stroke-opacity=".6" stroke-width="3"/>
    <path d="M 1750 -300 H 1852 V 700 H 1750 Z" fill="#E9E1D0"/><path d="M 1772 -300 V 700 M 1800 -300 V 700 M 1828 -300 V 700" stroke="#cfc4ac" stroke-opacity=".6" stroke-width="3"/>
  </g>
  <!-- sun rays on the wall -->
  <polygon points="1270,90 1190,90 360,520 380,720 1270,560" fill="#FFF1C9" opacity="${f(0.02 + 0.13 * pLight)}"/>
  <!-- wall art -->
  <g transform="translate(55 0)"><g transform="rotate(${f(-6 * (1 - pArt))} 1100 290)">
    <rect x="922" y="186" width="356" height="256" fill="#2b1a0c" opacity=".16" filter="url(#b10)" transform="translate(6 12)"/>
    <rect x="930" y="170" width="340" height="240" fill="${walnut}"/><rect x="944" y="184" width="312" height="212" fill="#F8F5EE"/>
    <circle cx="1052" cy="292" r="64" fill="#78B89A"/><path d="M 1110 396 a 64 64 0 0 1 0 -128 z" fill="#2C5F4F"/><rect x="960" y="360" width="280" height="6" fill="#D8CDB3"/>
  </g></g>
  <!-- sideboard: low console, kept low so the left wall stays clear for copy + CTAs -->
  <g>
    <rect x="76" y="696" width="468" height="46" fill="#2b1a0c" opacity=".3" filter="url(#b10)"/>
    <rect x="70" y="646" width="480" height="54" rx="8" fill="${walnut}"/>
    <rect x="86" y="656" width="140" height="34" rx="4" fill="#7c5b40"/><rect x="236" y="656" width="140" height="34" rx="4" fill="#7c5b40"/><rect x="386" y="656" width="148" height="34" rx="4" fill="#7c5b40"/>
    <rect x="70" y="646" width="480" height="7" rx="3" fill="#fff" opacity=".18"/>
    <rect x="96" y="698" width="12" height="24" fill="#4a3524"/><rect x="512" y="698" width="12" height="24" fill="#4a3524"/>
    <rect x="130" y="626" width="96" height="20" fill="#C9B48C"/><rect x="138" y="608" width="84" height="18" fill="#2C5F4F"/>
    <g opacity="${f(gone(pFloorB))}"><rect x="300" y="624" width="26" height="22" rx="5" fill="#fff"/><rect x="190" y="632" width="70" height="14" fill="#f4f1e8" stroke="#cfcabd" transform="rotate(-8 225 639)"/></g>
    <ellipse cx="300" cy="646" rx="230" ry="8" fill="#9a968c" opacity="${f(0.55 * (1 - pSurfaceDust))}" filter="url(#b4)"/>
  </g>

  <!-- floor -->
  ${floorLayer()}
  <rect x="-400" y="720" width="2800" height="980" fill="url(#floorAO)"/>
  <rect x="-400" y="706" width="2800" height="18" fill="#F7F3EA"/><rect x="-400" y="722" width="2800" height="8" fill="#2b1a0c" opacity=".25" filter="url(#b4)"/>
  <!-- window light on the floor -->
  <polygon points="1300,730 1040,730 560,1080 560,1700 1140,1700 1520,1000" fill="url(#beam)" filter="url(#b26)" opacity="${f(0.04 + 0.36 * pLight)}"/>
  <rect x="-400" y="740" width="2800" height="960" fill="url(#sheen)" opacity="${f(0.55 * pPolish)}"/>

  <g transform="translate(55 0)">
  <!-- rug -->
  <g>
    <polygon points="800,800 1480,800 1590,1012 690,1012" fill="${oat}"/>
    <polygon points="830,816 1450,816 1544,996 726,996" fill="none" stroke="#B9D6C6" stroke-width="12"/>
    <polygon points="880,832 1400,832 1486,980 794,980" fill="none" stroke="#2C5F4F" stroke-width="3" opacity=".7"/>
    <g opacity="${f(1 - pStain)}" filter="url(#b4)">
      <path d="M 1010 868 q 40 -22 78 6 q 18 30 -20 44 q -52 8 -58 -50 z" fill="#6b4a2d" opacity=".62"/>
      <path d="M 1290 920 q 34 -16 64 8 q 14 26 -18 36 q -44 4 -46 -44 z" fill="#4e4f48" opacity=".5"/>
      <path d="M 880 930 q 22 -14 46 2 q 8 20 -12 26 q -30 2 -34 -28 z" fill="#7b5b36" opacity=".55"/>
    </g>
  </g>

  <!-- shadows -->
  <ellipse cx="1100" cy="768" rx="500" ry="26" fill="#1b1408" opacity=".34" filter="url(#b10)"/>
  <ellipse cx="1160" cy="905" rx="310" ry="17" fill="#1b1408" opacity=".3" filter="url(#b10)"/>
  <!-- polish reflections -->
  <g opacity="${f(0.3 * pPolish)}" filter="url(#b10)"><rect x="1010" y="780" width="30" height="120" fill="#fff"/><rect x="1330" y="786" width="30" height="110" fill="#fff"/><rect x="1120" y="1010" width="180" height="40" rx="20" fill="#fff"/></g>

  <!-- sofa -->
  <g>
    <rect x="705" y="430" width="790" height="240" rx="64" fill="${sofa}"/>
    <rect x="705" y="430" width="790" height="240" rx="64" fill="url(#sofaTop)"/>
    <rect x="690" y="590" width="820" height="150" rx="38" fill="${sofa}"/>
    <rect x="690" y="590" width="820" height="150" rx="38" fill="url(#sofaTop)"/>
    <rect x="712" y="580" width="254" height="86" rx="26" fill="#EFE8DA"/><rect x="974" y="580" width="254" height="86" rx="26" fill="#EFE8DA"/><rect x="1236" y="580" width="254" height="86" rx="26" fill="#EFE8DA"/>
    <path d="M 966 590 v 76 M 1228 590 v 76" stroke="${sofaShade}" stroke-width="3"/>
    <rect x="652" y="510" width="96" height="236" rx="46" fill="${sofa}"/><rect x="652" y="510" width="96" height="236" rx="46" fill="url(#sofaTop)"/>
    <rect x="1452" y="510" width="96" height="236" rx="46" fill="${sofa}"/><rect x="1452" y="510" width="96" height="236" rx="46" fill="url(#sofaTop)"/>
    <rect x="720" y="740" width="14" height="32" rx="3" fill="${walnut}"/><rect x="1466" y="740" width="14" height="32" rx="3" fill="${walnut}"/>
    <!-- sofa stain + dust -->
    <path d="M 1100 626 q 30 -14 58 4 q 10 22 -14 28 q -38 2 -44 -32 z" fill="#8a7352" opacity="${f(0.5 * (1 - pStain))}" filter="url(#b4)"/>
    <ellipse cx="1100" cy="436" rx="330" ry="10" fill="#9a968c" opacity="${f(0.55 * (1 - pSurfaceDust))}" filter="url(#b4)"/>
  </g>
  ${throwMessy}
  ${throwClean}
  ${cushions}

  <!-- coffee table -->
  <g>
    <polygon points="${tableX + 36},${tableY - 26} ${tableX + 484},${tableY - 26} ${tableX + 520},${tableY} ${tableX},${tableY}" fill="#E9DFCB"/>
    <rect x="${tableX}" y="${tableY}" width="520" height="22" rx="3" fill="#C7B28C"/>
    <rect x="${tableX + 14}" y="${tableY + 22}" width="14" height="76" fill="#8a6a4c"/><rect x="${tableX + 492}" y="${tableY + 22}" width="14" height="76" fill="#8a6a4c"/>
    <rect x="${tableX + 30}" y="${tableY + 70}" width="460" height="10" fill="#B89D74"/>
    <ellipse cx="${tableX + 260}" cy="${tableY - 10}" rx="210" ry="6" fill="#9a968c" opacity="${f(0.5 * (1 - pSurfaceDust))}" filter="url(#b4)"/>
  </g>
  ${tableContentsMessy}
  ${tableContentsClean}

  ${floorClutter}
  </g>

  <!-- big plant -->
  <g transform="translate(1830 800)">
    <ellipse cx="0" cy="-4" rx="70" ry="12" fill="#1b1408" opacity=".3" filter="url(#b10)"/>
    <path d="M -54 -6 L -44 -150 H 44 L 54 -6 Z" fill="#E3D8C2"/><rect x="-48" y="-160" width="96" height="14" rx="5" fill="#D6CAB0"/>
    ${[
      [-120, -230, -62, 70],
      [-70, -330, -34, 84],
      [-10, -410, -4, 90],
      [60, -350, 28, 86],
      [118, -250, 58, 74],
      [-150, -160, -78, 56],
      [150, -170, 76, 58],
      [-30, -250, -16, 74],
      [40, -270, 18, 70],
    ]
      .map(
        ([x, y, rot, len], i) =>
          `<g transform="translate(${x} ${y}) rotate(${rot})"><ellipse rx="${f(len * 0.46)}" ry="${f(len)}" fill="${mix('#8FA38B', i % 2 ? '#4f9275' : '#5fa583', pPlant)}"/><path d="M 0 ${-len} V ${len}" stroke="#1d4636" stroke-opacity=".4" stroke-width="3"/></g><path d="M 0 -150 Q ${x * 0.3} ${y * 0.5} ${x} ${y}" stroke="${mix('#7b8a6f', '#3f7a5f', pPlant)}" stroke-width="4" fill="none"/>`,
      )
      .join('')}
    <ellipse cx="0" cy="-165" rx="46" ry="6" fill="#9a968c" opacity="${f(0.5 * (1 - pPlant))}"/>
  </g>
</g>

<!-- dust veil + motes + vignette sit OUTSIDE the grade so they read as haze -->
<g opacity="${f(0.5 * (1 - pDust))}"><rect x="${vb.x}" y="${vb.y}" width="${vb.w}" height="${vb.h}" filter="url(#speck)"/></g>
<rect x="${vb.x}" y="${vb.y}" width="${vb.w}" height="${vb.h}" fill="#8a8678" opacity="${f(0.2 * (1 - pDust))}"/>
${motes}
${sparkles}
<rect x="${vb.x}" y="${vb.y}" width="${vb.w}" height="${vb.h}" fill="url(#vig)"/>
</svg>`;
}

/* ----------------------------------------------------------------- run --- */
async function render(variantKey, t, file, format = 'webp') {
  const { px, q } = VARIANTS[variantKey];
  const svg = scene(t, variantKey);
  const img = sharp(Buffer.from(svg), { density: 96 }).resize(px[0], px[1]);
  if (format === 'png') await img.png().toFile(file);
  else await img.webp({ quality: q, effort: 5 }).toFile(file);
}

const arg = process.argv[2] ?? 'all';

if (arg === 'preview') {
  const dir = path.join(ROOT, '.preview');
  mkdirSync(dir, { recursive: true });
  for (const v of ['desktop', 'mobile']) {
    for (const t of [0, 0.3, 0.5, 0.75, 1]) {
      await render(v, t, path.join(dir, `${v}-t${Math.round(t * 100)}.png`), 'png');
    }
  }
  console.log('previews written to', dir);
} else {
  const targets = arg === 'all' ? ['desktop', 'mobile'] : [arg];
  for (const v of targets) {
    const dir = path.join(OUT, v);
    mkdirSync(dir, { recursive: true });
    const { count } = VARIANTS[v];
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      await render(v, t, path.join(dir, `frame-${String(i + 1).padStart(3, '0')}.webp`));
      if (i % 10 === 0) console.log(v, `${i + 1}/${count}`);
    }
  }
  writeFileSync(
    path.join(OUT, 'README.md'),
    '# PROTOTYPE hero frames\n\nThese frames are generated placeholder artwork (scripts/make-prototype-frames.mjs), NOT final Higgsfield renders.\nReplace per docs/higgsfield-production-guide.md and set `isPlaceholder: false` in src/data/heroSequence.js.\n',
  );
  console.log('done');
}
