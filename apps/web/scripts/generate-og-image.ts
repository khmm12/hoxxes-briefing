import { Buffer } from 'node:buffer'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'
import satori from 'satori'

const width = 1200
const height = 630
const background = '#14110b'
const textPrimary = '#fff7dd'
const textSecondary = '#d8c9a8'
const textMuted = '#8f846d'
const gold = '#dfb847'
const goldBright = '#f0ce61'
const goldDeep = '#c9971d'
const parchment = '#f5ecd4'
const rajdhani = 'Rajdhani'
const ibmPlexSans = 'IBM Plex Sans'

type SatoriStyle = Record<string, string | number>

type SatoriChild = SatoriElement | string

type SatoriProps = {
  children?: SatoriChild | SatoriChild[]
  height?: number
  src?: string
  style?: SatoriStyle
  width?: number
}

type SatoriElement = {
  props: SatoriProps
  type: string
}

const title = 'Hoxxes Briefing'
const slogan = 'Karl Would Be Proud!'
const subtitle = 'Weekly Deep Dive & Elite Deep Dive Board'
const description = 'Know the dive before you drop.'
const domainName = 'hoxxes-briefing'
const domainSuffix = '.vercel.app'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(scriptDir, '../public')
const emblemPath = resolve(scriptDir, '../src/pages/weekly/ui/brand-logo.svg')
const outputPath = resolve(publicDir, 'og-image.png')

const [rajdhaniBold, plexMedium, emblemSvg] = await Promise.all([
  loadFontsourceFont('@fontsource/rajdhani/files/rajdhani-latin-700-normal.woff'),
  loadFontsourceFont('@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-500-normal.woff'),
  readFile(emblemPath, 'utf8'),
])

const emblemSrc = svgDataUri(emblemSvg)
const svg = await satori(renderOpenGraphImage(emblemSrc) as Parameters<typeof satori>[0], {
  width,
  height,
  fonts: [
    {
      name: rajdhani,
      data: rajdhaniBold,
      weight: 700,
      style: 'normal',
    },
    {
      name: ibmPlexSans,
      data: plexMedium,
      weight: 500,
      style: 'normal',
    },
  ],
})

const png = new Resvg(svg, {
  fitTo: {
    mode: 'width',
    value: width,
  },
}).render()

await writeFile(outputPath, png.asPng())

console.log(`Generated ${outputPath}`)

async function loadFontsourceFont(specifier: string): Promise<ArrayBuffer> {
  const fontPath = fileURLToPath(import.meta.resolve(specifier))
  const fontData = await readFile(fontPath)

  return fontData.buffer.slice(fontData.byteOffset, fontData.byteOffset + fontData.byteLength)
}

function renderOpenGraphImage(emblemSrc: string): SatoriElement {
  return h(
    'div',
    {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: background,
        color: parchment,
        fontFamily: ibmPlexSans,
        overflow: 'hidden',
        position: 'relative',
      },
    },
    h('img', {
      src: svgDataUri(renderCaveTexture()),
      width,
      height,
      style: { position: 'absolute', left: 0, top: 0, display: 'flex' },
    }),
    h('img', {
      src: emblemSrc,
      width: 168,
      height: 199,
      style: { position: 'absolute', top: 64, left: 950, display: 'flex' },
    }),
    h(
      'div',
      {
        style: {
          position: 'absolute',
          top: 80,
          left: 84,
          display: 'flex',
          flexDirection: 'column',
        },
      },
      h(
        'div',
        {
          style: {
            display: 'flex',
            color: gold,
            fontFamily: rajdhani,
            fontWeight: 700,
            fontSize: 31,
            letterSpacing: 4,
            lineHeight: 1,
            whiteSpace: 'nowrap',
          },
        },
        subtitle.toUpperCase(),
      ),
      h(
        'div',
        {
          style: {
            marginTop: 22,
            display: 'flex',
            flexDirection: 'column',
            color: textPrimary,
            fontFamily: rajdhani,
            fontWeight: 700,
            fontSize: 118,
            lineHeight: 0.92,
            letterSpacing: 3,
          },
        },
        ...title
          .toUpperCase()
          .split(' ')
          .map((line) => h('div', { style: { display: 'flex' } }, line)),
      ),
      h(
        'div',
        {
          style: {
            marginTop: 26,
            display: 'flex',
            flexDirection: 'column',
          },
        },
        h(
          'div',
          { style: { display: 'flex', fontFamily: ibmPlexSans, fontSize: 31, color: textSecondary, lineHeight: 1.3 } },
          description,
        ),
        h(
          'div',
          {
            style: {
              marginTop: 14,
              display: 'flex',
              color: gold,
              fontFamily: rajdhani,
              fontWeight: 700,
              fontSize: 31,
              letterSpacing: 3.5,
              lineHeight: 1,
            },
          },
          slogan.toUpperCase(),
        ),
      ),
    ),
    h(
      'div',
      {
        style: {
          position: 'absolute',
          left: 84,
          bottom: 40,
          display: 'flex',
          fontFamily: ibmPlexSans,
          fontSize: 30,
          lineHeight: 1,
        },
      },
      h('div', { style: { display: 'flex', color: parchment } }, domainName),
      h('div', { style: { display: 'flex', color: textMuted } }, domainSuffix),
    ),
  )
}

function renderCaveTexture(): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <radialGradient id="title-glow" cx="26%" cy="32%" r="50%">
      <stop offset="0%" stop-color="${goldBright}" stop-opacity="0.07"/>
      <stop offset="100%" stop-color="${gold}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="emblem-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${goldBright}" stop-opacity="0.24"/>
      <stop offset="60%" stop-color="${gold}" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="${gold}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="pocket-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${goldBright}" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="${gold}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="crystal" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${goldBright}"/>
      <stop offset="100%" stop-color="${goldDeep}"/>
    </linearGradient>
    <radialGradient id="vignette" cx="50%" cy="46%" r="74%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="62%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.52"/>
    </radialGradient>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.78" numOctaves="3" seed="27" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 0.08"/>
      </feComponentTransfer>
    </filter>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#title-glow)"/>
  <circle cx="1034" cy="168" r="230" fill="url(#emblem-glow)"/>

  <path d="M0 0 H1200 V40 L1144 86 L1096 52 L1032 110 L968 58 L900 92 L846 48 L780 104 L712 54 L648 84 L586 44 L516 96 L448 50 L386 78 L322 42 L252 88 L186 46 L122 72 L62 40 L0 66 Z" fill="#0c0a06"/>
  <path d="M0 66 L62 40 L122 72 L186 46 L252 88 L322 42 L386 78 L448 50 L516 96 L586 44 L648 84 L712 54 L780 104 L846 48 L900 92 L968 58 L1032 110 L1096 52 L1144 86 L1200 40" fill="none" stroke="${goldBright}" stroke-width="1.2" opacity="0.1"/>
  <g fill="url(#crystal)">
    <path d="M1032 110 l8 0 -4 24Z" opacity="0.45"/>
  </g>

  <path d="M0 488 L120 478 L228 492 L342 480 L466 490 L578 440 L700 468 L818 434 L932 470 L1052 438 L1146 466 L1200 446 V630 H0 Z" fill="#1f1a0f"/>
  <path d="M0 488 L120 478 L228 492 L342 480 L466 490 L578 440 L700 468 L818 434 L932 470 L1052 438 L1146 466 L1200 446" fill="none" stroke="${goldBright}" stroke-width="1.4" opacity="0.14"/>

  <path d="M0 528 L140 510 L268 536 L398 514 L532 540 L664 516 L796 542 L924 518 L1056 540 L1200 522 V630 H0 Z" fill="#151109"/>
  <path d="M0 528 L140 510 L268 536 L398 514 L532 540 L664 516 L796 542 L924 518 L1056 540 L1200 522" fill="none" stroke="${goldBright}" stroke-width="1.2" opacity="0.11"/>

  <path d="M0 606 L160 596 L320 610 L478 598 L640 612 L800 600 L958 612 L1116 600 L1200 608 V630 H0 Z" fill="#0b0806"/>
  <path d="M0 606 L160 596 L320 610 L478 598 L640 612 L800 600 L958 612 L1116 600 L1200 608" fill="none" stroke="${goldBright}" stroke-width="1.2" opacity="0.07"/>

  <g fill="none" stroke="${gold}" stroke-linecap="round" stroke-width="1.8">
    <path d="M120 478 L228 492 L342 480" opacity="0.14"/>
    <path d="M578 430 L700 468 L818 434" opacity="0.22"/>
    <path d="M932 470 L1052 438 L1146 466" opacity="0.22"/>
    <path d="M140 510 L268 536 L398 514" opacity="0.12"/>
    <path d="M664 516 L796 542 L924 518" opacity="0.12"/>
    <path d="M228 492 L252 526 M700 468 L726 528 M1052 438 L1072 512" opacity="0.1"/>
  </g>

  <circle cx="818" cy="440" r="62" fill="url(#pocket-glow)"/>
  <circle cx="1048" cy="442" r="52" fill="url(#pocket-glow)"/>

  <g fill="url(#crystal)">
    <path d="M806 436 l12 -34 12 34 -12 13Z" opacity="0.9"/>
    <path d="M826 442 l8 -21 8 21 -8 9Z" opacity="0.65"/>
    <path d="M796 440 l6 -15 6 15 -6 7Z" opacity="0.45"/>
    <path d="M1036 436 l10 -26 10 26 -10 11Z" opacity="0.8"/>
    <path d="M1052 442 l7 -17 7 17 -7 8Z" opacity="0.55"/>
    <path d="M256 530 l8 -20 8 20 -8 9Z" opacity="0.35"/>
    <path d="M788 536 l8 -21 8 21 -8 9Z" opacity="0.4"/>
    <path d="M470 594 l7 -16 7 16 -7 7Z" opacity="0.25"/>
  </g>

  <g fill="${gold}">
    <circle cx="700" cy="140" r="2" opacity="0.3"/>
    <circle cx="780" cy="250" r="1.6" opacity="0.24"/>
    <circle cx="620" cy="200" r="1.4" opacity="0.2"/>
    <circle cx="880" cy="330" r="1.8" opacity="0.26"/>
    <circle cx="420" cy="340" r="1.6" opacity="0.22"/>
    <circle cx="540" cy="450" r="1.4" opacity="0.18"/>
    <circle cx="940" cy="460" r="1.6" opacity="0.2"/>
    <circle cx="180" cy="300" r="1.4" opacity="0.18"/>
  </g>

  <rect width="${width}" height="${height}" fill="${parchment}" opacity="0.18" filter="url(#grain)"/>
  <rect width="${width}" height="${height}" fill="url(#vignette)"/>
</svg>`
}

function svgDataUri(source: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(source).toString('base64')}`
}

function h(type: string, props: Omit<SatoriProps, 'children'> = {}, ...children: SatoriChild[]): SatoriElement {
  return {
    type,
    props: {
      ...props,
      children: children.length === 1 ? children[0] : children,
    },
  }
}
