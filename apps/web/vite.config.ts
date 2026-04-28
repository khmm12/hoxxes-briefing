import { fileURLToPath } from 'node:url'
import { defineConfig, type ViteUserConfig } from 'vitest/config'
import { lingui as linguiPlugin, linguiTransformerBabelPreset } from '@lingui/vite-plugin'
import babelPlugin from '@rolldown/plugin-babel'
import { VitePWA } from 'vite-plugin-pwa'
import solidPlugin from 'vite-plugin-solid'

export const localApiDevOrigin = 'http://localhost:3001'

export function createWebViteConfig(): ViteUserConfig {
  return {
    plugins: [
      solidPlugin({
        babel: {
          plugins: ['@lingui/babel-plugin-lingui-macro'],
        },
      }),
      linguiPlugin(),
      babelPlugin({
        presets: [linguiTransformerBabelPreset()],
      }),
      VitePWA({
        registerType: 'prompt',
        manifest: false,
        injectManifest: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          globIgnores: [
            'icon-192x192.png',
            'icon-512x512.png',
            'icon-maskable-192x192.png',
            'icon-maskable-512x512.png',
            'icon-pwa-maskable.svg',
            'og-image.png',
            'google*.html',
          ],
        },
        strategies: 'injectManifest',
        srcDir: 'src/app',
        filename: 'sw.ts',
        devOptions: {
          enabled: false,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '~': fileURLToPath(new URL('./src', import.meta.url)),
        'styled-system': fileURLToPath(new URL('./styled-system', import.meta.url)),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: localApiDevOrigin,
        },
      },
    },
    test: {
      environment: 'node',
      include: ['*.test.ts', 'src/**/*.test.ts'],
    },
  }
}

export default defineConfig(createWebViteConfig())
