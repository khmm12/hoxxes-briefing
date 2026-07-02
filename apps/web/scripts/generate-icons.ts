// Single codegen for every PWA visual asset, driven by assets/icons/emblem.ts.
//
// Rasterizes all PNGs once (committed artifacts — NOT regenerated on each build, which
// cost ~8s) and lets Vite own cache-busting: the install icons and splash PNGs live in
// assets/icons/ and are referenced by RELATIVE paths (from index.html and the manifest
// template), so Vite content-hashes them into dist/assets/ automatically. The only fixed
// path is public/favicon.ico (crawler fallback — cannot be hashed).
//
// What it writes:
//   - src/pages/briefing/ui/brand/brand-logo.svg  — the in-app logo (Vite-imported asset)
//   - assets/icons/{apple-touch-icon,icon-192,icon-512,icon-maskable-512}.png
//   - assets/icons/splash/apple-splash-*.png  — 38 iOS launch screens
//   - assets/icons/favicon.svg            — the live SVG favicon (rounded tile)
//   - public/favicon.ico                  — rasterized from the same favicon tile
//   - index.html                          — the 38 splash <link> tags, between markers
//
// Run via `pnpm gen:icons` after changing emblem.ts. Requires oxipng on PATH.

import { execFile } from 'node:child_process'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { generateFavicon, generateMaskableAsset, generateTransparentAsset } from '@vite-pwa/assets-generator/api'
import { instructions } from '@vite-pwa/assets-generator/api/instructions'
import {
  type AppleDeviceName,
  appleSplashScreenSizes,
  createAppleSplashScreens,
} from '@vite-pwa/assets-generator/config'
import { renderBareLogo, renderFaviconTile, renderFullBleedIcon } from '../assets/icons/emblem.ts'

const execFileAsync = promisify(execFile)

const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const iconsDir = resolve(webRoot, 'assets/icons')
const splashDir = resolve(iconsDir, 'splash')

const SVG_HEADER =
  '<!-- @generated from assets/icons/emblem.ts by scripts/generate-icons.ts — edit the source, not this file -->\n'
const PNG = { compressionLevel: 9, palette: false }
const SPLASH_MARKERS = /(<!-- splash:start[^>]*-->)[\s\S]*?( {4}<!-- splash:end -->)/

await assertOxipng()

const written: string[] = []

// In-app brand logo: an SVG on disk because BrandLogo.tsx imports it as a URL asset.
await writeFile(resolve(webRoot, 'src/pages/briefing/ui/brand/brand-logo.svg'), SVG_HEADER + renderBareLogo())

// Install icons from the full-bleed mark (app icon at 0.86; maskable tighter at 0.72 so the
// emblem clears Android's safe circle). Transparent never shows — the gold plate fills the square.
const appIcon = Buffer.from(renderFullBleedIcon(0.86))
const maskableIcon = Buffer.from(renderFullBleedIcon(0.72))
await writeIcon('apple-touch-icon.png', await transparentPng(appIcon, 180))
await writeIcon('icon-192.png', await transparentPng(appIcon, 192))
await writeIcon('icon-512.png', await transparentPng(appIcon, 512))
await writeIcon('icon-maskable-512.png', await maskablePng(maskableIcon, 512))

// Browser-tab favicon, both faces from the same rounded tile: favicon.svg served live (Vite-hashed
// from assets/icons/) and favicon.ico as the crawler fallback at the fixed /favicon.ico path (not
// Vite-hashed, not oxipng'd — ICO, not PNG).
const faviconTile = Buffer.from(renderFaviconTile())
await writeFile(resolve(iconsDir, 'favicon.svg'), SVG_HEADER + renderFaviconTile())
const faviconPng = await transparentPng(faviconTile, 32)
await writeFile(resolve(webRoot, 'public/favicon.ico'), await generateFavicon('png', faviconPng))

// iOS splash screens. The 53-device table holds 19 unique (w,h,scaleFactor) tuples; one name per
// tuple → 38 PNGs (×2 orientations). instructions() also yields each tag's media query, so the
// PNG set and the <link> block come from one source and cannot drift.
await rm(splashDir, { recursive: true, force: true })
await mkdir(splashDir, { recursive: true })
const splashTags = await generateSplash()
await patchIndexHtml(splashTags)

// Lossless only — palette/lossy quantization bands the gold gradient.
await execFileAsync('oxipng', ['-o', 'max', '--strip', 'safe', ...written])

console.log(`generate-icons: ${written.length} PNGs + favicon.ico + brand-logo.svg + ${splashTags.length} splash tags`)

// --- helpers ---

async function transparentPng(svg: Buffer, size: number): Promise<Buffer> {
  const sharp = await generateTransparentAsset('png', svg, size, {
    padding: 0,
    resizeOptions: { background: 'transparent' },
    outputOptions: PNG,
  })
  return sharp.toBuffer()
}

async function maskablePng(svg: Buffer, size: number): Promise<Buffer> {
  const sharp = await generateMaskableAsset('png', svg, size, {
    padding: 0,
    resizeOptions: { background: 'transparent' },
    outputOptions: PNG,
  })
  return sharp.toBuffer()
}

async function writeIcon(name: string, buffer: Buffer): Promise<void> {
  const path = resolve(iconsDir, name)
  await writeFile(path, buffer)
  written.push(path)
}

async function generateSplash(): Promise<Array<{ media: string; href: string }>> {
  // Pass every device name; instructions() dedups by (width,height) internally, and the filename
  // keys on size (not device), so the full table collapses to the same 38 unique PNGs.
  const deviceNames = Object.keys(appleSplashScreenSizes) as AppleDeviceName[]

  const splash = await instructions({
    imageResolver: () => Buffer.from(renderBareLogo()),
    // Unused: every non-splash preset below is empty, so no favicon/SVG is generated and the
    // imageName never reaches the API's `.svg` branch. The field is still required.
    imageName: '',
    basePath: '/',
    resolveSvgName: () => '',
    preset: {
      transparent: { sizes: [], padding: 0 },
      maskable: { sizes: [] },
      apple: { sizes: [] },
      appleSplashScreens: createAppleSplashScreens(
        {
          // Mark on the dark canvas at ~40% width. One #090909 set covers both schemes — the app is always dark.
          padding: 0.3,
          resizeOptions: { background: '#090909', fit: 'contain' },
          name: (landscape, size) =>
            `apple-splash-${landscape ? 'landscape' : 'portrait'}-${size.width}x${size.height}.png`,
        },
        deviceNames,
      ),
      png: PNG,
    },
    htmlLinks: { xhtml: false, includeId: false },
  })

  // Rasterize all 38 in parallel; Promise.all preserves order, so the written paths and the
  // emitted <link> block stay deterministic (a stable index.html diff) despite concurrent writes.
  const tags = await Promise.all(
    Object.values(splash.appleSplashScreen).map(async (asset) => {
      const file = asset.url.slice(1)
      const path = resolve(splashDir, file)
      await writeFile(path, await asset.buffer())
      return { path, media: asset.linkObject?.media ?? '', href: `./assets/icons/splash/${file}` }
    }),
  )
  for (const { path } of tags) written.push(path)
  return tags.map(({ media, href }) => ({ media, href }))
}

async function patchIndexHtml(tags: Array<{ media: string; href: string }>): Promise<void> {
  const indexPath = resolve(webRoot, 'index.html')
  const html = await readFile(indexPath, 'utf8')
  // Presence is the only failure: an unchanged block (re-run without editing the device table)
  // must be a successful no-op, not a false "markers not found". Splash filenames are independent
  // of emblem.ts, so the regenerated block is byte-identical on the common edit-and-rerun path.
  if (!SPLASH_MARKERS.test(html)) {
    throw new Error(
      'generate-icons: splash markers not found in index.html (<!-- splash:start --> … <!-- splash:end -->)',
    )
  }
  const block = tags
    .map(({ media, href }) => `    <link rel="apple-touch-startup-image" media="${media}" href="${href}" />`)
    .join('\n')
  await writeFile(indexPath, html.replace(SPLASH_MARKERS, `$1\n${block}\n$2`))
}

async function assertOxipng(): Promise<void> {
  try {
    await execFileAsync('oxipng', ['--version'])
  } catch {
    throw new Error('generate-icons: oxipng not found — install it first (brew install oxipng)')
  }
}
