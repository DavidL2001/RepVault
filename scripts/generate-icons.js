import { readFileSync, writeFileSync } from 'node:fs'
import { deflateSync, inflateSync } from 'node:zlib'

// Makes every icon size the app needs from `scripts/icon-source.png` (the logo: a black
// rounded square on a light background) and writes them into `public/`.
// Run with `npm run icons` after replacing the source image.
// No image library needed: PNG decoding, cropping and resizing are done here.

const SOURCE = new URL('./icon-source.png', import.meta.url)
const PUBLIC_DIR = new URL('../public/', import.meta.url)

/** Corner radius of icons that keep transparent rounded corners, as a share of the size. */
const ROUNDED_CORNER_RADIUS = 0.2

/**
 * Android crops maskable icons to a circle or other shape; only a centered circle with a
 * radius of 40% of the size is always visible. The artwork is shrunk to fit a little
 * inside that circle (radius as a share of the icon size).
 */
const MASKABLE_SAFE_RADIUS = 0.38

/** Pixels darker than this (0–255 luminance) belong to the logo, not the light background. */
const LOGO_LUMINANCE_MAX = 128

/** Pixels trimmed off each side of the cut-out, to drop the soft edge into the background. */
const EDGE_TRIM = 2

/** How far inside the rounded corner's curve the background fill reaches, over its soft edge. */
const CORNER_EDGE_MARGIN = 3

/** Summed RGB difference from the logo background above which a pixel is artwork. */
const ARTWORK_COLOR_DIFFERENCE = 60

/**
 * Icons to write:
 * - `rounded`: full logo with transparent rounded corners (browser tab, "any" icons)
 * - `fullBleed`: square logo, for platforms that round the corners themselves (iOS)
 * - `maskable`: smaller logo on a square background, for Android's shaped icons
 */
const ICONS = [
  { file: 'favicon.png', size: 64, style: 'rounded' },
  { file: 'pwa-192x192.png', size: 192, style: 'rounded' },
  { file: 'pwa-512x512.png', size: 512, style: 'rounded' },
  { file: 'maskable-512x512.png', size: 512, style: 'maskable' },
  { file: 'apple-touch-icon.png', size: 180, style: 'fullBleed' },
]

// ---- PNG decoding (8-bit RGB or RGBA, not interlaced) ----

const CHANNELS_BY_COLOR_TYPE = { 2: 3, 6: 4 }

function paeth(a, b, c) {
  const p = a + b - c
  const [pa, pb, pc] = [Math.abs(p - a), Math.abs(p - b), Math.abs(p - c)]
  if (pa <= pb && pa <= pc) return a
  return pb <= pc ? b : c
}

/** Reads a PNG into `{ width, height, pixels }`, pixels as RGBA bytes row by row. */
function decodePng(file) {
  let offset = 8 // after the signature
  let header
  const data = []
  while (offset < file.length) {
    const length = file.readUInt32BE(offset)
    const type = file.toString('ascii', offset + 4, offset + 8)
    const body = file.subarray(offset + 8, offset + 8 + length)
    if (type === 'IHDR') header = body
    if (type === 'IDAT') data.push(body)
    offset += length + 12
  }
  const width = header.readUInt32BE(0)
  const height = header.readUInt32BE(4)
  const channels = CHANNELS_BY_COLOR_TYPE[header[9]]
  if (header[8] !== 8 || !channels || header[12] !== 0) {
    throw new Error('icon-source.png must be an 8-bit RGB or RGBA PNG without interlacing')
  }

  const raw = inflateSync(Buffer.concat(data))
  const stride = width * channels
  const rows = Buffer.alloc(stride * height)
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)]
    for (let x = 0; x < stride; x++) {
      const value = raw[y * (stride + 1) + 1 + x]
      const left = x >= channels ? rows[y * stride + x - channels] : 0
      const up = y > 0 ? rows[(y - 1) * stride + x] : 0
      const upLeft = x >= channels && y > 0 ? rows[(y - 1) * stride + x - channels] : 0
      const predictor = [0, left, up, (left + up) >> 1, paeth(left, up, upLeft)][filter]
      rows[y * stride + x] = (value + predictor) & 0xff
    }
  }

  const pixels = Buffer.alloc(width * height * 4)
  for (let i = 0; i < width * height; i++) {
    rows.copy(pixels, i * 4, i * channels, i * channels + 3)
    pixels[i * 4 + 3] = channels === 4 ? rows[i * channels + 3] : 255
  }
  return { width, height, pixels }
}

// ---- Cutting the logo out of the source ----

const luminance = (pixels, i) =>
  0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2]

/**
 * The logo as a square image without the light background: the bounding box of the dark
 * pixels, trimmed a little, with everything outside its rounded corners filled with the
 * logo's own background color, so every size can round the corners its own way.
 * Also works out how small the logo must be drawn on maskable icons (`maskableScale`).
 */
function cutOutLogo({ width, height, pixels }) {
  const isLogo = (x, y) => luminance(pixels, (y * width + x) * 4) <= LOGO_LUMINANCE_MAX
  let [left, top, right, bottom] = [width, height, -1, -1]
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!isLogo(x, y)) continue
      left = Math.min(left, x)
      right = Math.max(right, x)
      top = Math.min(top, y)
      bottom = Math.max(bottom, y)
    }
  }
  const fullSize = Math.min(right - left, bottom - top) + 1

  // Walking diagonally in from the top-left corner, the curve of a corner with radius r
  // is reached after r × (1 − 1/√2) steps.
  let steps = 0
  while (!isLogo(left + steps, top + steps)) steps++
  const radius = steps / (1 - Math.SQRT1_2)
  const inside = steps + CORNER_EDGE_MARGIN
  const backgroundAt = ((top + inside) * width + left + inside) * 4
  const background = [...pixels.subarray(backgroundAt, backgroundAt + 3)]

  const size = fullSize - 2 * EDGE_TRIM
  const logo = Buffer.alloc(size * size * 4)
  let farthestArtwork = 0
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const target = (y * size + x) * 4
      // Position within the untrimmed logo, to compare with its rounded corners.
      const [fx, fy] = [x + EDGE_TRIM + 0.5, y + EDGE_TRIM + 0.5]
      const dx = Math.max(radius - fx, 0, fx - (fullSize - radius))
      const dy = Math.max(radius - fy, 0, fy - (fullSize - radius))
      if (Math.hypot(dx, dy) > radius - CORNER_EDGE_MARGIN) {
        logo.set([...background, 255], target)
        continue
      }
      const source = ((top + EDGE_TRIM + y) * width + left + EDGE_TRIM + x) * 4
      pixels.copy(logo, target, source, source + 4)

      const difference = background.reduce(
        (sum, value, channel) => sum + Math.abs(value - pixels[source + channel]),
        0,
      )
      if (difference > ARTWORK_COLOR_DIFFERENCE) {
        const distance = Math.hypot(x + 0.5 - size / 2, y + 0.5 - size / 2) / size
        farthestArtwork = Math.max(farthestArtwork, distance)
      }
    }
  }
  const maskableScale = Math.min(1, MASKABLE_SAFE_RADIUS / farthestArtwork)
  return { size, pixels: logo, background, maskableScale }
}

// ---- Drawing the icons ----

/** Color of the logo at (u, v) in 0–1, blending the four nearest pixels. */
function sampleLogo(logo, u, v) {
  const x = Math.min(Math.max(u * logo.size - 0.5, 0), logo.size - 1)
  const y = Math.min(Math.max(v * logo.size - 0.5, 0), logo.size - 1)
  const [x0, y0] = [Math.floor(x), Math.floor(y)]
  const [x1, y1] = [Math.min(x0 + 1, logo.size - 1), Math.min(y0 + 1, logo.size - 1)]
  const [fx, fy] = [x - x0, y - y0]
  const at = (px, py, channel) => logo.pixels[(py * logo.size + px) * 4 + channel]
  return [0, 1, 2].map(
    (channel) =>
      at(x0, y0, channel) * (1 - fx) * (1 - fy) +
      at(x1, y0, channel) * fx * (1 - fy) +
      at(x0, y1, channel) * (1 - fx) * fy +
      at(x1, y1, channel) * fx * fy,
  )
}

/** Whether (u, v) in 0–1 lies inside a square with rounded corners of radius r. */
function insideRoundedSquare(u, v, r) {
  const dx = Math.max(r - u, 0, u - (1 - r))
  const dy = Math.max(r - v, 0, v - (1 - r))
  return dx * dx + dy * dy <= r * r
}

/** RGBA pixels of one icon, averaging several samples per pixel for smooth results. */
function drawIcon(logo, size, style) {
  const samplesPerAxis = Math.max(2, Math.ceil((logo.size / size) * 2))
  const logoScale = style === 'maskable' ? logo.maskableScale : 1
  const radius = style === 'rounded' ? ROUNDED_CORNER_RADIUS : 0
  const pixels = Buffer.alloc(size * size * 4)

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const sum = [0, 0, 0]
      let covered = 0
      for (let sy = 0; sy < samplesPerAxis; sy++) {
        for (let sx = 0; sx < samplesPerAxis; sx++) {
          const u = (col + (sx + 0.5) / samplesPerAxis) / size
          const v = (row + (sy + 0.5) / samplesPerAxis) / size
          if (radius && !insideRoundedSquare(u, v, radius)) continue
          // Outside the (shrunk) logo is the logo's background color.
          const lu = (u - 0.5) / logoScale + 0.5
          const lv = (v - 0.5) / logoScale + 0.5
          const inLogo = lu >= 0 && lu <= 1 && lv >= 0 && lv <= 1
          const color = inLogo ? sampleLogo(logo, lu, lv) : logo.background
          color.forEach((value, channel) => (sum[channel] += value))
          covered++
        }
      }
      const offset = (row * size + col) * 4
      for (let channel = 0; channel < 3; channel++) {
        pixels[offset + channel] = covered ? Math.round(sum[channel] / covered) : 0
      }
      pixels[offset + 3] = Math.round((covered / samplesPerAxis ** 2) * 255)
    }
  }
  return pixels
}

// ---- PNG encoding ----

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

const logo = cutOutLogo(decodePng(readFileSync(SOURCE)))
console.log(
  `Logo found: ${logo.size}×${logo.size}px, drawn at ${Math.round(logo.maskableScale * 100)}% on maskable icons`,
)
for (const { file, size, style } of ICONS) {
  writeFileSync(new URL(file, PUBLIC_DIR), encodePng(size, drawIcon(logo, size, style)))
  console.log(`Wrote public/${file}`)
}
