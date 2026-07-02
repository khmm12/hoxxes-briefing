import { afterEach, describe, expect, it, vi } from 'vitest'
import { CONTRACT_REV } from '@hoxxes-briefing/contracts'
import { briefingUrl } from './briefing-client'
import { cacheBriefing, clearCachedBriefing, readCachedBriefing } from './briefing-client-cache'

type FakeCache = {
  initialResponse?: Response
  match: ReturnType<typeof vi.fn>
  put: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
}

const createMission = () => ({
  primaryObjective: {
    kind: 'DeepScan' as const,
    resonanceCrystals: 2,
  },
  secondaryObjective: {
    kind: 'Blackbox' as const,
    blackBoxes: 1,
  },
  anomaly: null,
  warning: 'RegenerativeBugs' as const,
})

const createDive = (name: string) => ({
  name,
  biome: 'AzureWeald' as const,
  missions: [createMission(), createMission(), createMission()],
})

const createBriefingPayload = () => ({
  seed: 1234567890,
  confidence: 'verified' as const,
  release: '2026-04-16T11:00:00.000Z',
  expiration: '2026-04-23T11:00:00.000Z',
  dives: {
    normal: createDive('Crystal Depths'),
    elite: createDive('Lethal Depths'),
  },
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('briefing cache helpers', () => {
  it('cache/read/delete helpers persist and clear a schema-versioned briefing', async () => {
    const fakeCache = createFakeCache()
    vi.stubGlobal('caches', {
      open: vi.fn(async () => fakeCache),
    })

    const payload = createBriefingPayload()
    await cacheBriefing(payload)

    expect(fakeCache.put).toHaveBeenCalledOnce()
    const [request, response] = fakeCache.put.mock.calls[0]
    expect(request).toBe('/api/v1/briefing')

    const raw = await response.clone().json()
    expect(raw.schemaVersion).toBe(1)
    expect(raw.contractRev).toBe(CONTRACT_REV)
    expect(raw.payload.seed).toBe(1234567890)

    const readResult = await readCachedBriefing()
    expect(readResult).toBeDefined()
    expect(readResult?.seed).toBe(1234567890)

    await clearCachedBriefing()
    expect(fakeCache.delete).toHaveBeenCalledWith('/api/v1/briefing')
  })

  it('drops a cached briefing written under a different contract revision', async () => {
    const staleEnvelope = JSON.stringify({
      schemaVersion: 1,
      contractRev: CONTRACT_REV + 1,
      payload: createBriefingPayload(),
    })
    const fakeCache = createFakeCache({
      initialResponse: new Response(staleEnvelope, { headers: { 'content-type': 'application/json' } }),
    })
    vi.stubGlobal('caches', {
      open: vi.fn(async () => fakeCache),
    })

    const readResult = await readCachedBriefing()

    expect(readResult).toBeNull()
    expect(fakeCache.delete).toHaveBeenCalledWith(briefingUrl)
  })

  it('delete helper clears only the briefing key', async () => {
    const deleteMock = vi.fn(async () => undefined)
    const fakeCache = createFakeCache({ delete: deleteMock })

    vi.stubGlobal('caches', {
      open: vi.fn(async () => fakeCache),
    })

    await clearCachedBriefing('https://example.test/api/v1/briefing?source=ui')

    expect(deleteMock).toHaveBeenCalledOnce()
    expect(deleteMock).toHaveBeenCalledWith('/api/v1/briefing?source=ui')
  })

  it('drops and clears a cached entry whose payload no longer matches the schema', async () => {
    const deleteMock = vi.fn(async () => undefined)
    const fakeCache = createFakeCache({
      initialResponse: new Response(JSON.stringify({ schemaVersion: 1, payload: { stale: true } }), {
        headers: { 'content-type': 'application/json' },
      }),
      delete: deleteMock,
    })

    vi.stubGlobal('caches', {
      open: vi.fn(async () => fakeCache),
    })

    const result = await readCachedBriefing()

    expect(result).toBeNull()
    expect(deleteMock).toHaveBeenCalledWith('/api/v1/briefing')
  })

  it('falls back to the default cache key when the request URL cannot be parsed', async () => {
    const deleteMock = vi.fn(async () => undefined)
    const fakeCache = createFakeCache({ delete: deleteMock })

    vi.stubGlobal('caches', {
      open: vi.fn(async () => fakeCache),
    })

    await clearCachedBriefing('http://')

    expect(deleteMock).toHaveBeenCalledWith(briefingUrl)
  })
})

function createFakeCache(overrides: Partial<FakeCache> = {}): FakeCache {
  let response = overrides.initialResponse
  const match = vi.fn(async () => response)
  const put = vi.fn(async (_request: RequestInfo | URL, next: Response) => {
    response = next
  })
  const deleteFn = vi.fn(async () => {
    response = undefined
  })

  return {
    match,
    put: overrides.put ?? put,
    delete: overrides.delete ?? deleteFn,
    initialResponse: response,
  }
}
