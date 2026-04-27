import { Buffer } from 'node:buffer'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'
import satori from 'satori'

const width = 1200
const height = 630
const background = '#11110d'
const textPrimary = '#fff7dd'
const textSecondary = '#d8c9a8'
const textMuted = '#8f846d'
const textFaint = '#5f5848'
const gold = '#dfb847'
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

const textForFonts = [title, subtitle, description, slogan, domainName, domainSuffix].join(' ')
const scriptDir = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(scriptDir, '../public')
const emblemPath = resolve(scriptDir, '../src/pages/weekly/ui/brand-logo.svg')
const outputPath = resolve(publicDir, 'og-image.png')

const [rajdhaniBold, plexMedium, emblemSvg] = await Promise.all([
  loadGoogleFont(rajdhani, 700, textForFonts),
  loadGoogleFont(ibmPlexSans, 500, textForFonts),
  readFile(emblemPath, 'utf8'),
])

const emblemSrc = svgDataUri(emblemSvg)
const backgroundSrc = svgDataUri(renderBackgroundTexture())
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

async function loadGoogleFont(family: string, weight: 500 | 700, text: string): Promise<ArrayBuffer> {
  const familyParam = family.replaceAll(' ', '+')
  const url = `https://fonts.googleapis.com/css2?family=${familyParam}:wght@${weight}&text=${encodeURIComponent(text)}`
  const cssResponse = await fetch(url)

  if (!cssResponse.ok) {
    throw new Error(`Failed to load Google Font CSS for ${family}: ${cssResponse.status} ${cssResponse.statusText}`)
  }

  const css = await cssResponse.text()
  const resource = css.match(/src:\s*url\(([^)]+)\)\s*format\('(opentype|truetype|woff)'\)/)

  if (resource == null) {
    throw new Error(`Could not find a Satori-compatible font resource for ${family} in:\n${css}`)
  }

  const fontResponse = await fetch(resource[1])

  if (!fontResponse.ok) {
    throw new Error(`Failed to load Google Font data for ${family}: ${fontResponse.status} ${fontResponse.statusText}`)
  }

  return fontResponse.arrayBuffer()
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
      src: backgroundSrc,
      width,
      height,
      style: {
        position: 'absolute',
        left: 0,
        top: 0,
        display: 'flex',
      },
    }),
    h('img', {
      src: emblemSrc,
      width: 112,
      height: 132,
      style: {
        position: 'absolute',
        top: 68,
        left: 544,
        display: 'flex',
      },
    }),
    h(
      'div',
      {
        style: {
          position: 'absolute',
          top: 214,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        },
      },
      h(
        'div',
        {
          style: {
            display: 'flex',
            color: textPrimary,
            fontFamily: rajdhani,
            fontSize: 104,
            lineHeight: 0.92,
          },
        },
        title,
      ),
      h(
        'div',
        {
          style: {
            marginTop: 18,
            display: 'flex',
            color: gold,
            fontFamily: rajdhani,
            fontSize: 45,
            lineHeight: 1,
          },
        },
        subtitle,
      ),
      h(
        'div',
        {
          style: {
            marginTop: 30,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: textSecondary,
            fontFamily: ibmPlexSans,
            fontSize: 26,
            lineHeight: 1.32,
          },
        },
        h('div', { style: { display: 'flex', fontSize: 26 } }, description),
        h('div', { style: { display: 'flex', marginTop: 10, fontSize: 24 } }, slogan),
      ),
    ),
    h('div', {
      style: {
        position: 'absolute',
        left: 438,
        right: 438,
        bottom: 80,
        height: 1,
        display: 'flex',
        backgroundColor: 'rgba(223, 184, 71, 0.46)',
      },
    }),
    h(
      'div',
      {
        style: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 34,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: textMuted,
          fontFamily: ibmPlexSans,
          fontSize: 22,
          lineHeight: 1,
        },
      },
      h('div', { style: { display: 'flex' } }, domainName),
      h('div', { style: { display: 'flex', color: textFaint } }, domainSuffix),
    ),
  )
}

function renderBackgroundTexture(): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <radialGradient id="gold-glow" cx="50%" cy="34%" r="42%">
      <stop offset="0%" stop-color="${gold}" stop-opacity="0.18"/>
      <stop offset="42%" stop-color="${gold}" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="${gold}" stop-opacity="0"/>
    </radialGradient>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.78" numOctaves="3" seed="27" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 0.08"/>
      </feComponentTransfer>
    </filter>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#gold-glow)"/>
  <rect width="${width}" height="${height}" fill="${parchment}" opacity="0.18" filter="url(#grain)"/>

  <g fill="none" stroke="${gold}" stroke-linecap="round" stroke-linejoin="round">
    <path d="M90 174 184 108 296 150 336 232 254 298 142 260Z" opacity="0.055"/>
    <path d="M888 116 1010 78 1112 152 1082 274 958 306 858 230Z" opacity="0.06"/>
    <path d="M906 498 1002 428 1124 456 1146 542 1038 596 926 574Z" opacity="0.05"/>
    <path d="M72 472 178 420 280 468 242 560 124 568Z" opacity="0.045"/>
  </g>

  <g fill="${gold}" opacity="0.16">
    <circle cx="192" cy="114" r="2"/>
    <circle cx="1000" cy="128" r="2"/>
    <circle cx="1092" cy="520" r="2"/>
    <circle cx="146" cy="514" r="1.6"/>
    <circle cx="316" cy="196" r="1.5"/>
    <circle cx="852" cy="222" r="1.5"/>
  </g>
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
