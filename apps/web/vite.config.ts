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
        // Precache the app shell: index.html plus everything Vite hashes into
        // assets/ — JS, CSS, woff2, and any app-imported image. An image the app
        // renders is offline by default because Vite emits it into assets/, so no
        // glob change is needed when you add one (reach for a runtime cache only
        // if you ever precache something large/responsive — see Workbox).
        //
        // Browser/OS chrome (favicon, apple-touch, manifest install icons,
        // og-image) lives at the dist root, not under assets/, so it stays out
        // automatically; its versioned filenames already handle cache-busting.
        // The literal index.html (not *.html) keeps the search-console
        // verification file out without a globIgnores entry. woff is omitted —
        // every @font-face is woff2-first, so the woff fallback is never fetched.
        injectManifest: {
          globPatterns: ['index.html', 'assets/**/*.{js,css,woff2,png,svg,jpg,jpeg,webp,avif,gif}'],
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
