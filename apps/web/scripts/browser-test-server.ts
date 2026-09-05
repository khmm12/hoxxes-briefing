import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { extname, join, resolve } from 'node:path'
import { build } from 'vite'
import { createWebViteConfig } from '../vite.config.ts'

// Two real production builds share an origin. Only their HTML marker differs;
// Workbox sees that revision change and installs the next precache normally.
const output = await mkdtemp(join(tmpdir(), 'hoxxes-browser-'))
let deployed = 'one'
let retired = false
let holdInstall = false
const heldInstalls = new Set<() => void>()
const fixture: unknown = JSON.parse(
  await readFile(new URL('../../../test/fixtures/briefing/2026-09-03.json', import.meta.url), 'utf8'),
)

for (const version of ['one', 'two']) {
  const config = createWebViteConfig()
  await build({
    ...config,
    configFile: false,
    logLevel: 'warn',
    plugins: [
      config.plugins,
      {
        name: 'browser-test-build-marker',
        transformIndexHtml: {
          order: 'pre',
          handler: () => [{ tag: 'meta', attrs: { name: 'test-build', content: version }, injectTo: 'head' }],
        },
      },
    ],
    build: { outDir: join(output, version), emptyOutDir: true },
  })
}

const contentTypes: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1:4174')
    res.setHeader('Cache-Control', 'no-store')
    if (req.method === 'POST' && url.pathname.startsWith('/__test/')) {
      if (url.pathname === '/__test/deploy/one') {
        deployed = 'one'
        retired = false
        holdInstall = false
      } else if (url.pathname === '/__test/retire') retired = true
      else if (url.pathname === '/__test/deploy/two') {
        deployed = 'two'
        retired = false
        holdInstall = true
      } else if (url.pathname === '/__test/release-install') holdInstall = false
      else {
        res.writeHead(404).end()
        return
      }
      if (!holdInstall) {
        for (const release of heldInstalls) release()
        heldInstalls.clear()
      }
      res.writeHead(204).end()
      return
    }
    if (url.pathname === '/__test/status') {
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ deployed, heldInstalls: heldInstalls.size }))
      return
    }
    if (url.pathname === '/api/v1/briefing') {
      res.setHeader('Content-Type', 'application/json')
      if (retired) {
        res.writeHead(410).end(JSON.stringify({ code: 'CONTRACT_RETIRED', message: 'Update required' }))
      } else {
        res.end(
          JSON.stringify({
            ...(fixture as object),
            confidence: 'verified',
            release: new Date(Date.now() - 86_400_000).toISOString(),
            expiration: new Date(Date.now() + 6 * 86_400_000).toISOString(),
          }),
        )
      }
      return
    }
    const path = url.pathname === '/' || !extname(url.pathname) ? '/index.html' : url.pathname
    const root = join(output, deployed)
    const file = resolve(root, `.${path}`)
    if (!file.startsWith(`${root}/`)) {
      res.writeHead(404).end()
      return
    }
    const body = await readFile(file)
    // Hold the new worker's real HTML precache fetch, not the page navigation.
    // This makes a slow installation deterministic without mocking SW APIs.
    if (holdInstall && path === '/index.html' && req.headers.referer?.endsWith('/sw.js')) {
      await new Promise<void>((resolve) => {
        heldInstalls.add(resolve)
      })
    }
    res.setHeader('Content-Type', contentTypes[extname(path)] ?? 'application/octet-stream')
    res.end(body)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') console.error(error)
    res.writeHead(404).end()
  }
})

server.listen(4174, '127.0.0.1', () => console.log('Browser test server: http://127.0.0.1:4174'))
process.once('SIGTERM', async () => {
  for (const release of heldInstalls) release()
  server.close()
  server.closeAllConnections()
  await rm(output, { recursive: true, force: true })
  process.exit(0)
})
