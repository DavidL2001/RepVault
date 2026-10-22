import { writeFileSync } from 'node:fs'
import { deflateSync } from 'node:zlib'
import { brandColors } from './palette.js'

// Draws the app icon (a dumbbell) and writes every size the PWA needs into `public/`.
// Run with `npm run icons` after changing the shapes or the colors in `_colors.scss`.
// No image library needed: the shapes are rounded rectangles, rasterized here.

const PUBLIC_DIR = new URL('../public/', import.meta.url)

/** Samples per pixel along each axis, for smooth (anti-aliased) edges. */
const SUPERSAMPLING = 4

/** Corner radius of the icon background where the platform doesn't round it itself. */
const ROUNDED_CORNER_RADIUS = 0.2

/**
 * The dumbbell, on a 1×1 canvas. It stays within the maskable safe zone
 * (a circle of radius 0.4 around the center), so Android can crop it to any shape.
 * Each part: `{ x, y, w, h, r }`.
 */
const DUMBBELL = [
  // Bar
  { x: 0.17, y: 0.47, w: 0.66, h: 0.06, r: 0.03 },
  // Outer plates
  { x: 0.2, y: 0.38, w: 0.07, h: 0.24, r: 0.025 },
  { x: 0.73, y: 0.38, w: 0.07, h: 0.24, r: 0.025 },
  // Inner plates
  { x: 0.285, y: 0.32, w: 0.08, h: 0.36, r: 0.03 },
  { x: 0.635, y: 0.32, w: 0.08, h: 0.36, r: 0.03 },
]

/**
 * Icons to write. `rounded`: transparent corners (for "any" purpose icons and the favicon).
 * Full-bleed ones are for platforms that apply their own mask (Android maskable, iOS).
 */
const PNG_ICONS = [
  { file: 'pwa-192x192.png', size: 192, rounded: true },
  { file: 'pwa-512x512.png', size: 512, rounded: true },
  { file: 'maskable-512x512.png', size: 512, rounded: false },
  { file: 'apple-touch-icon.png', size: 180, rounded: false },
]

/** Whether point (px, py) lies inside a rounded rectangle. */
function isInside({ x, y, w, h, r }, px, py) {
  // Distance from the point to the rectangle shrunk by r; inside when within r of it.
  const dx = Math.max(x + r - px, 0, px - (x + w - r))
  const dy = Math.max(y + r - py, 0, py - (y + h - r))
  return px >= x && px <= x + w && py >= y && py <= y + h && dx * dx + dy * dy <= r * r
}

/** The shapes to draw, back to front, with their colors. */
function layers({ rounded }) {
  const { background, accent } = brandColors()
  const backgroundShape = { x: 0, y: 0, w: 1, h: 1, r: rounded ? ROUNDED_CORNER_RADIUS : 0 }
  return [
    { shape: backgroundShape, color: background },
    ...DUMBBELL.map((shape) => ({ shape, color: accent })),
  ]
}

/** "#0b0c0f" → [11, 12, 15] */
function hexToRgb(hex) {
  return [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16))
}

/** RGBA pixels for a square icon, row by row. */
function rasterize(size, options) {
  const drawn = layers(options).map(({ shape, color }) => ({ shape, rgb: hexToRgb(color) }))
  const pixels = Buffer.alloc(size * size * 4)
  const samples = SUPERSAMPLING * SUPERSAMPLING

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const sum = [0, 0, 0, 0]
      for (let sy = 0; sy < SUPERSAMPLING; sy++) {
        for (let sx = 0; sx < SUPERSAMPLING; sx++) {
          const px = (col + (sx + 0.5) / SUPERSAMPLING) / size
          const py = (row + (sy + 0.5) / SUPERSAMPLING) / size
          // The front-most shape at this point wins; nothing means transparent.
          const top = drawn.findLast(({ shape }) => isInside(shape, px, py))
          if (!top) continue
          top.rgb.forEach((value, channel) => (sum[channel] += value))
          sum[3] += 255
        }
      }
      const coverage = sum[3] / 255
      const offset = (row * size + col) * 4
      // Average color over the covered samples, alpha by coverage.
      for (let channel = 0; channel < 3; channel++) {
        pixels[offset + channel] = coverage ? Math.round(sum[channel] / coverage) : 0
      }
      pixels[offset + 3] = Math.round(sum[3] / samples)
    }
  }
  return pixels
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([length, body, crc])
}

/** Encodes RGBA pixels as a PNG file. */
function encodePng(size, pixels) {
  const header = Buffer.alloc(13)
  header.writeUInt32BE(size, 0)
  header.writeUInt32BE(size, 4)
  header[8] = 8 // bits per channel
  header[9] = 6 // color type: RGBA
  // Every row starts with filter type 0 (none).
  const rowBytes = size * 4
  const raw = Buffer.alloc((rowBytes + 1) * size)
  for (let row = 0; row < size; row++) {
    pixels.copy(raw, row * (rowBytes + 1) + 1, row * rowBytes, (row + 1) * rowBytes)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

/** The same icon as an SVG, for the browser tab. */
function svgIcon() {
  const SVG_SIZE = 100
  const scaled = (value) => +(value * SVG_SIZE).toFixed(2)
  const rects = layers({ rounded: true }).map(
    ({ shape: { x, y, w, h, r }, color }) =>
      `  <rect x="${scaled(x)}" y="${scaled(y)}" width="${scaled(w)}" height="${scaled(h)}" rx="${scaled(r)}" fill="${color}"/>`,
  )
  return [
    '<!-- Generated by scripts/generate-icons.js. Edit that script, not this file. -->',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SVG_SIZE} ${SVG_SIZE}">`,
    ...rects,
    '</svg>',
    '',
  ].join('\n')
}

for (const { file, size, rounded } of PNG_ICONS) {
  writeFileSync(new URL(file, PUBLIC_DIR), encodePng(size, rasterize(size, { rounded })))
  console.log(`Wrote public/${file}`)
}
writeFileSync(new URL('favicon.svg', PUBLIC_DIR), svgIcon())
console.log('Wrote public/favicon.svg')
