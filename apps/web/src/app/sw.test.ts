// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'

const mockPrecacheAndRoute = vi.fn()
const mockCleanupOutdatedCaches = vi.fn()
const mockCreateHandlerBoundToURL = vi.fn((url: string) => `handler:${url}`)
const mockRegisterRoute = vi.fn()
const mockNavigationRoute = vi.fn(
  class MockNavigationRoute {
    handler: unknown
    options: unknown

    constructor(handler: unknown, options: unknown) {
      this.handler = handler
      this.options = options
    }
  },
)
vi.mock('workbox-precaching', () => ({
  cleanupOutdatedCaches: mockCleanupOutdatedCaches,
  createHandlerBoundToURL: mockCreateHandlerBoundToURL,
  precacheAndRoute: mockPrecacheAndRoute,
}))

vi.mock('workbox-routing', () => ({
  NavigationRoute: mockNavigationRoute,
  registerRoute: mockRegisterRoute,
}))

type MockServiceWorkerEvent = {
  data?: {
    type?: string
  }
  waitUntil?: (value: Promise<unknown>) => void
}

const swModuleUrl = new URL('./sw.ts', import.meta.url)

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe('service worker', () => {
  it('sets up app-shell precaching and routing', async () => {
    const listeners = new Map<string, (event: MockServiceWorkerEvent) => void>()
    const fakeCaches = createFakeCaches([])

    vi.stubGlobal('caches', fakeCaches)
    vi.stubGlobal('self', createFakeServiceWorkerGlobalScope(listeners))

    await import(`${swModuleUrl.href}?shell=${Date.now()}`)

    expect(mockPrecacheAndRoute).toHaveBeenCalledWith([])
    expect(mockCleanupOutdatedCaches).toHaveBeenCalledTimes(1)

    expect(mockRegisterRoute).toHaveBeenCalledTimes(1)

    const navigationRouteCall = mockNavigationRoute.mock.calls[0]
    expect(mockCreateHandlerBoundToURL).toHaveBeenCalledWith('index.html')
    expect(navigationRouteCall?.[1]).toMatchObject({
      denylist: expect.arrayContaining([expect.any(RegExp)]),
    })
  })

  it('acknowledges SW skip-waiting update messages', async () => {
    const listeners = new Map<string, (event: MockServiceWorkerEvent) => void>()
    const fakeSelf = createFakeServiceWorkerGlobalScope(listeners)

    vi.stubGlobal('caches', createFakeCaches([]))
    vi.stubGlobal('self', fakeSelf)

    await import(`${swModuleUrl.href}?skip=${Date.now()}`)

    listeners.get('message')?.({ data: { type: 'SKIP_WAITING' } })
    expect(fakeSelf.skipWaiting).toHaveBeenCalledTimes(1)
  })

  it('cleans up old weekly data caches on activate', async () => {
    const listeners = new Map<string, (event: MockServiceWorkerEvent) => void>()
    const waitUntilCalls: Promise<unknown>[] = []
    const fakeCaches = createFakeCaches([
      'hoxxes-briefing-weekly-cache-v0',
      'hoxxes-briefing-weekly-cache-v2',
      'hoxxes-briefing-weekly-cache-v1',
      'hoxxes-briefing-weekly-cache-v1-stale',
      'drg-weekly-ui-cache-v0',
      'drg-weekly-shell-v2',
      'hoxxes-briefing-weekly-cache-v3',
    ])

    vi.stubGlobal('caches', fakeCaches)
    vi.stubGlobal('self', createFakeServiceWorkerGlobalScope(listeners))

    await import(`${swModuleUrl.href}?cleanup=${Date.now()}`)

    listeners.get('activate')?.({
      waitUntil(work) {
        waitUntilCalls.push(work)
      },
    })

    await Promise.all(waitUntilCalls)

    expect(fakeCaches.delete).toHaveBeenCalledTimes(4)
    expect(fakeCaches.delete.mock.calls).toEqual(
      expect.arrayContaining([
        ['hoxxes-briefing-weekly-cache-v0'],
        ['hoxxes-briefing-weekly-cache-v2'],
        ['hoxxes-briefing-weekly-cache-v1-stale'],
        ['hoxxes-briefing-weekly-cache-v3'],
      ]),
    )
    expect(fakeCaches.delete).not.toHaveBeenCalledWith('hoxxes-briefing-weekly-cache-v1')
    expect(fakeCaches.delete).not.toHaveBeenCalledWith('drg-weekly-ui-cache-v0')
    expect(fakeCaches.delete).not.toHaveBeenCalledWith('drg-weekly-shell-v2')
  })
})

function createFakeServiceWorkerGlobalScope(listeners: Map<string, (event: MockServiceWorkerEvent) => void>) {
  return {
    addEventListener(type: string, handler: (event: MockServiceWorkerEvent) => void) {
      listeners.set(type, handler)
    },
    skipWaiting: vi.fn(async () => undefined),
  }
}

function createFakeCaches(keys: string[]) {
  return {
    delete: vi.fn(async () => undefined),
    keys: vi.fn(async () => keys),
  }
}
