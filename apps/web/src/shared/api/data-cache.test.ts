import { afterEach, describe, expect, it, vi } from 'vitest'
import { clearStaleDataCaches } from './data-cache'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('clearStaleDataCaches', () => {
  it('resolves without touching CacheStorage when it is unavailable', async () => {
    // happy-dom defines no `caches`; the guard must short-circuit instead of
    // dereferencing the missing global.
    await expect(clearStaleDataCaches()).resolves.toBeUndefined()
  })

  it('evicts superseded data-cache versions, keeping the live one', async () => {
    const deleteMock = vi.fn(async () => true)
    vi.stubGlobal('caches', {
      keys: vi.fn(async () => [
        // Unrelated retired cache — not ours to delete.
        'hoxxes-briefing-weekly-cache-v1',
        // Superseded data-cache version — dropped.
        'hoxxes-briefing-data-cache-v0',
        // The live data cache — kept.
        'hoxxes-briefing-data-cache-v1',
        'unrelated-cache',
      ]),
      delete: deleteMock,
    })

    await clearStaleDataCaches()

    expect(deleteMock).toHaveBeenCalledOnce()
    expect(deleteMock).toHaveBeenCalledWith('hoxxes-briefing-data-cache-v0')
    expect(deleteMock).not.toHaveBeenCalledWith('hoxxes-briefing-data-cache-v1')
    expect(deleteMock).not.toHaveBeenCalledWith('hoxxes-briefing-weekly-cache-v1')
    expect(deleteMock).not.toHaveBeenCalledWith('unrelated-cache')
  })
})
