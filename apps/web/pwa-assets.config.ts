import { type AssetType, defineConfig, type ResolvedAssetSize } from '@vite-pwa/assets-generator/config'

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
      sizes: [192, 512],
      padding: 0,
      resizeOptions: {
        background: 'transparent',
      },
    },
    maskable: {
      sizes: [192, 512],
      padding: 0,
      resizeOptions: {
        background: 'transparent',
      },
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
      return `icon-${size.width}x${size.height}.png`
    case 'maskable':
      return `icon-maskable-${size.width}x${size.height}.png`
    case 'apple':
      return size.width === 180 && size.height === 180
        ? 'apple-touch-icon.png'
        : `apple-touch-icon-${size.width}x${size.height}.png`
  }
}
