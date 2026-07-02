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

  it('drops retired weekly caches and superseded briefing caches on activate, keeping the live one', async () => {
    const listeners = new Map<string, (event: MockServiceWorkerEvent) => void>()
    const waitUntilCalls: Promise<unknown>[] = []
    const fakeCaches = createFakeCaches([
      // Retired pre-briefing data caches — every version is dropped.
      'hoxxes-briefing-weekly-cache-v0',
      'hoxxes-briefing-weekly-cache-v1',
      // Superseded briefing schema version — dropped.
      'hoxxes-briefing-data-cache-v0',
      // The live briefing cache — kept.
      'hoxxes-briefing-data-cache-v1',
      // Unrelated caches — kept.
      'drg-weekly-ui-cache-v0',
      'workbox-precache-v2-index',
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

    expect(fakeCaches.delete).toHaveBeenCalledTimes(3)
    expect(fakeCaches.delete.mock.calls).toEqual(
      expect.arrayContaining([
        ['hoxxes-briefing-weekly-cache-v0'],
        ['hoxxes-briefing-weekly-cache-v1'],
        ['hoxxes-briefing-data-cache-v0'],
      ]),
    )
    expect(fakeCaches.delete).not.toHaveBeenCalledWith('hoxxes-briefing-data-cache-v1')
    expect(fakeCaches.delete).not.toHaveBeenCalledWith('drg-weekly-ui-cache-v0')
    expect(fakeCaches.delete).not.toHaveBeenCalledWith('workbox-precache-v2-index')
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
