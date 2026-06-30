import { readFile } from 'node:fs/promises'
import { basename, dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin, type ViteUserConfig } from 'vitest/config'
import { lingui as linguiPlugin, linguiTransformerBabelPreset } from '@lingui/vite-plugin'
import babelPlugin from '@rolldown/plugin-babel'
import { VitePWA } from 'vite-plugin-pwa'
import solidPlugin from 'vite-plugin-solid'

const manifestTemplate = fileURLToPath(new URL('./assets/manifest.webmanifest', import.meta.url))

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
        // Precache the app shell: index.html, the JS/CSS/font chunks Vite hashes into assets/,
        // and the images the app actually renders as page subresources (the favicon SVG; the
        // brand logo is inlined into the JS bundle under the 4 KB limit). The two globs split
        // those intents — code/fonts unconditionally, images minus the install artifacts below.
        //
        // Platform-install assets are subtracted by globIgnores: the manifest install icons, the
        // home-screen apple-touch icon, and the pre-WebView iOS launch screens all land in assets/
        // with Vite hashes too, but the OS/Safari fetch them out of SW scope at install time —
        // never as page subresources — so the SW can never serve them and precaching ~2 MB of them
        // is dead weight. The generated manifest.webmanifest and public/favicon.ico sit at the dist
        // root, out of the globs by path. index.html (literal, not *.html) keeps the search-console
        // verification file out. woff is omitted — every @font-face is woff2-first, so the woff
        // fallback is never fetched.
        injectManifest: {
          globPatterns: ['index.html', 'assets/**/*.{js,css,woff2}', 'assets/**/*.{png,svg,jpg,jpeg,webp,avif,gif}'],
          globIgnores: ['**/icon-*', '**/apple-touch-icon-*', '**/apple-splash-*'],
        },
        strategies: 'injectManifest',
        srcDir: 'src/app',
        filename: 'sw.ts',
        devOptions: {
          enabled: false,
          type: 'module',
        },
      }),
      webManifest(),
    ],
    resolve: {
      alias: {
        '~': fileURLToPath(new URL('./src', import.meta.url)),
        '~test': fileURLToPath(new URL('./test', import.meta.url)),
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
      environment: 'jsdom',
      setupFiles: ['./vitest.setup.ts'],
      include: ['*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{ts,tsx}'],
        // Type-only files, the bootstrap entry, the service worker (covered by
        // its own sw.test.ts), and the dev-only playground/fixtures are not
        // behavior we unit-test here. NB: do NOT blanket-exclude index.{ts,tsx} —
        // under FSD the component implementations live in `<Name>/index.tsx`
        // (and shared/ui/styling/index.ts holds real logic), so that glob would
        // drop the very files these tests cover. Pure re-export barrels stay in
        // and read ~100% once a test imports through them.
        exclude: ['src/**/*.d.ts', 'src/main.tsx', 'src/app/sw.ts', 'src/**/dev/**'],
      },
    },
  }
}

// The OS installer reads the web manifest as a static JSON file, so neither Vite's index.html
// asset rewriting nor vite-plugin-pwa ever content-hashes its icon paths (vite-plugin-pwa is
// left `manifest: false` on purpose — its generateWebManifestFile is `JSON.stringify(manifest)`
// verbatim, so it would ship un-busted icon URLs). This one plugin owns the manifest end to end
// from a single template read: at build it routes each icon through Vite's asset pipeline
// (this.resolve → emitFile → getFileName) and emits the manifest with the hashed paths; in dev,
// where that bundle does not exist, it serves the template with each icon rebased onto the path
// Vite serves the source file from. It computes no hash itself — Vite owns cache-busting end to
// end, exactly as for the index.html-referenced assets. The template references its icons by
// ordinary relative paths and carries every non-icon field verbatim.
function webManifest(): Plugin {
  const refs = new Map<string, string>()
  let manifest: ManifestTemplate
  let root: string
  let isBuild = false
  return {
    name: 'web-manifest',
    configResolved(config) {
      root = config.root
      isBuild = config.command === 'build'
    },
    // dev: the build bundle does not exist, so serve the template directly. Vite serves source
    // files from the project root, so an icon at assets/icons/x.png is reachable at the path it
    // sits at relative to root — derive that instead of assuming a fixed `/assets/` prefix.
    configureServer(server) {
      server.middlewares.use('/manifest.webmanifest', async (_req, res) => {
        const template = await loadManifestTemplate()
        const icons = template.icons.map((icon) => ({ ...icon, src: devIconUrl(icon.src) }))
        res.setHeader('Content-Type', 'application/manifest+json')
        res.end(JSON.stringify({ ...template, icons }, null, 2))
      })
    },
    // build: resolve and emit each icon so Vite content-hashes it, recording its reference id.
    // buildStart also fires in serve, where emitFile is unsupported — dev is handled by the
    // middleware above, so there's nothing to do.
    async buildStart() {
      if (!isBuild) return
      refs.clear()
      manifest = await loadManifestTemplate()
      for (const icon of manifest.icons) {
        const resolved = await this.resolve(icon.src, manifestTemplate)
        if (!resolved) throw new Error(`web-manifest: cannot resolve icon "${icon.src}"`)
        const source = await readFile(resolved.id)
        refs.set(icon.src, this.emitFile({ type: 'asset', name: basename(resolved.id), source }))
      }
    },
    generateBundle() {
      const icons = manifest.icons.map((icon) => ({
        ...icon,
        src: `/${this.getFileName(refs.get(icon.src) ?? '')}`,
      }))
      this.emitFile({
        type: 'asset',
        fileName: 'manifest.webmanifest',
        source: JSON.stringify({ ...manifest, icons }, null, 2),
      })
    },
  }

  function devIconUrl(src: string): string {
    const fromRoot = relative(root, resolve(dirname(manifestTemplate), src))
    return `/${fromRoot.split(sep).join('/')}`
  }
}

type ManifestTemplate = { icons: Array<{ src: string }>; [field: string]: unknown }

async function loadManifestTemplate(): Promise<ManifestTemplate> {
  return JSON.parse(await readFile(manifestTemplate, 'utf8'))
}

export default defineConfig(createWebViteConfig())
