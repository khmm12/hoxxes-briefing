import { afterEach, describe, expect, it, vi } from 'vitest'
import { weeklySnapshotUrl } from './weekly-client'
import { clearCachedWeeklySnapshot, readCachedWeeklySnapshot, writeCachedWeeklySnapshot } from './weekly-client-cache'

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
  mutator: null,
  warning: 'RegenerativeBugs' as const,
})

const createDive = (name: string) => ({
  name,
  biome: 'AzureWeald' as const,
  missions: [createMission(), createMission(), createMission()],
})

const createWeeklyPayload = () => ({
  week: {
    id: '2026-W17',
    seed: 1234567890,
    release: '2026-04-16T11:00:00.000Z',
    expiration: '2026-04-23T11:00:00.000Z',
  },
  dives: {
    normal: createDive('Crystal Routes'),
    elite: createDive('Lethal Depths'),
  },
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('weekly cache helpers', () => {
  it('write/read/delete cache helpers persist and clear a schema-versioned snapshot', async () => {
    const fakeCache = createFakeCache()
    vi.stubGlobal('caches', {
      open: vi.fn(async () => fakeCache),
    })

    const payload = createWeeklyPayload()
    await writeCachedWeeklySnapshot(payload)

    expect(fakeCache.put).toHaveBeenCalledOnce()
    const [request, response] = fakeCache.put.mock.calls[0]
    expect(request).toBe('/api/v1/weekly')

    const raw = await response.clone().json()
    expect(raw.schemaVersion).toBe(1)
    expect(raw.payload.week.id).toBe('2026-W17')

    const readResult = await readCachedWeeklySnapshot()
    expect(readResult).toBeDefined()
    expect(readResult?.week.id).toBe('2026-W17')

    await clearCachedWeeklySnapshot()
    expect(fakeCache.delete).toHaveBeenCalledWith('/api/v1/weekly')
  })

  it('delete helper clears only the weekly snapshot key', async () => {
    const deleteMock = vi.fn(async () => undefined)
    const fakeCache = createFakeCache({ delete: deleteMock })

    vi.stubGlobal('caches', {
      open: vi.fn(async () => fakeCache),
    })

    await clearCachedWeeklySnapshot('https://example.test/api/v1/weekly?source=ui')

    expect(deleteMock).toHaveBeenCalledOnce()
    expect(deleteMock).toHaveBeenCalledWith('/api/v1/weekly?source=ui')
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

    const result = await readCachedWeeklySnapshot()

    expect(result).toBeNull()
    expect(deleteMock).toHaveBeenCalledWith('/api/v1/weekly')
  })

  it('falls back to the default cache key when the request URL cannot be parsed', async () => {
    const deleteMock = vi.fn(async () => undefined)
    const fakeCache = createFakeCache({ delete: deleteMock })

    vi.stubGlobal('caches', {
      open: vi.fn(async () => fakeCache),
    })

    await clearCachedWeeklySnapshot('http://')

    expect(deleteMock).toHaveBeenCalledWith(weeklySnapshotUrl)
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
