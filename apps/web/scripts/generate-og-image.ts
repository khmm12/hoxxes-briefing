import { Buffer } from 'node:buffer'
import { execFile } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { Resvg } from '@resvg/resvg-js'
import satori from 'satori'
import { renderBareLogo } from '../assets/icons/emblem.ts'

const execFileAsync = promisify(execFile)

const width = 1200
const height = 630
const background = '#14110b'
const textPrimary = '#fff7dd'
const textSecondary = '#d8c9a8'
const textMuted = '#8f846d'
const gold = '#dfb847'
const goldBright = '#f0ce61'
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
const outputPath = resolve(publicDir, 'og-image.png')

await assertOxipng()

const [rajdhaniBold, plexMedium] = await Promise.all([
  loadFontsourceFont('@fontsource/rajdhani/files/rajdhani-latin-700-normal.woff'),
  loadFontsourceFont('@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-500-normal.woff'),
])

const emblemSrc = svgDataUri(renderBareLogo())
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

// Lossless only — palette/lossy quantization bands the gold gradient (same constraint as gen:icons).
await execFileAsync('oxipng', ['-o', 'max', '--strip', 'safe', outputPath])

console.log(`Generated ${outputPath}`)

async function assertOxipng(): Promise<void> {
  try {
    await execFileAsync('oxipng', ['--version'])
  } catch {
    throw new Error('generate-og-image: oxipng not found — install it first (brew install oxipng)')
  }
}

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
      <stop offset="0%" stop-color="${goldBright}" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="${gold}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="emblem-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${goldBright}" stop-opacity="0.22"/>
      <stop offset="60%" stop-color="${gold}" stop-opacity="0.07"/>
      <stop offset="100%" stop-color="${gold}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vignette" cx="50%" cy="46%" r="74%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="62%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.5"/>
    </radialGradient>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#title-glow)"/>
  <circle cx="1034" cy="168" r="230" fill="url(#emblem-glow)"/>

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
