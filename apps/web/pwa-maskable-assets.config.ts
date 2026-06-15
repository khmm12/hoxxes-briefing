import { type AssetType, defineConfig, type ResolvedAssetSize } from '@vite-pwa/assets-generator/config'

// Android maskable icon only. Its source (icon-pwa-maskable.svg) carries the
// emblem at 0.72 so the wing tips stay inside the maskable 80% safe circle —
// the home-screen/browser icons keep the fuller 0.86 emblem via
// pwa-assets.config.ts.
export default defineConfig({
  images: ['public/icon-pwa-maskable.svg'],
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
      sizes: [],
    },
    maskable: {
      sizes: [512],
      padding: 0,
      resizeOptions: {
        background: 'transparent',
      },
    },
    apple: {
      sizes: [],
    },
    assetName,
  },
})

function assetName(type: AssetType, size: ResolvedAssetSize): string {
  if (type !== 'maskable') {
    throw new Error(`pwa-maskable-assets.config only generates maskable icons, got "${type}"`)
  }

  return `icon-maskable-${size.width}.png`
}
