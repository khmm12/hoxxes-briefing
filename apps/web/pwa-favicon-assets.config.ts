import { type AssetType, defineConfig, type ResolvedAssetSize } from '@vite-pwa/assets-generator/config'

// Filename version — see pwa-assets.config.ts. Versions the served SVG favicon
// (Safari's tab icon); favicon.ico below stays unversioned as the crawler fallback.
const ICON_VERSION = 'v1'

export default defineConfig({
  images: [`public/favicon.${ICON_VERSION}.svg`],
  headLinkOptions: {
    basePath: '/',
    preset: '2023',
    resolveSvgName: () => `favicon.${ICON_VERSION}.svg`,
  },
  manifestIconsEntry: false,
  preset: {
    transparent: {
      sizes: [],
      padding: 0,
      favicons: [[32, 'favicon.ico']],
    },
    maskable: {
      sizes: [],
    },
    apple: {
      sizes: [],
    },
    assetName,
  },
})

function assetName(type: AssetType, size: ResolvedAssetSize): string {
  if (type !== 'transparent') {
    throw new Error(`pwa-favicon-assets.config only generates the favicon, got "${type}"`)
  }

  return `favicon-${size.width}x${size.height}.png`
}
