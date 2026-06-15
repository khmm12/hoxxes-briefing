import { type AssetType, defineConfig, type ResolvedAssetSize } from '@vite-pwa/assets-generator/config'

// Bump on every artwork change. Safari caches favicons by URL and ignores query
// strings, so the only reliable cache-bust is a new filename. Keep in sync with
// the other configs, index.html, manifest.webmanifest, and the favicon.<v>.svg
// source. favicon.ico stays unversioned as the root crawler fallback.
const ICON_VERSION = 'v1'

// Home-screen and browser icons (apple-touch + any-purpose 192/512) generate from
// the full-bleed app-icon source, where the emblem sits at 0.86. Android maskable
// icons need the emblem inside their 80% safe circle, so they generate from
// app-maskable-icon.svg (emblem at 0.72) via pwa-maskable-assets.config.ts.
export default defineConfig({
  images: ['assets/icons/app-icon.svg'],
  headLinkOptions: {
    basePath: '/',
    preset: '2023',
  },
  preset: {
    png: {
      compressionLevel: 9,
      palette: false,
    },
    transparent: {
      sizes: [192, 512],
      padding: 0,
      resizeOptions: {
        background: 'transparent',
      },
    },
    maskable: {
      sizes: [],
    },
    apple: {
      sizes: [180],
      padding: 0,
      resizeOptions: {
        background: 'transparent',
      },
    },
    assetName,
  },
})

function assetName(type: AssetType, size: ResolvedAssetSize): string {
  switch (type) {
    case 'transparent':
      return `icon-${size.width}.${ICON_VERSION}.png`
    case 'apple':
      return size.width === 180
        ? `apple-touch-icon.${ICON_VERSION}.png`
        : `apple-touch-icon-${size.width}.${ICON_VERSION}.png`
    default:
      throw new Error(`pwa-assets.config does not generate "${type}" icons`)
  }
}
