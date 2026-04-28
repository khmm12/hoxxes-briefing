import {
  type AssetType,
  defaultAssetName,
  defineConfig,
  type ResolvedAssetSize,
} from '@vite-pwa/assets-generator/config'

export default defineConfig({
  images: ['public/favicon.svg'],
  headLinkOptions: {
    basePath: '/',
    preset: '2023',
    resolveSvgName: () => 'favicon.svg',
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
  switch (type) {
    case 'transparent':
      return `favicon-${size.width}x${size.height}.png`
    case 'maskable':
    case 'apple':
      return defaultAssetName(type, size)
  }
}
