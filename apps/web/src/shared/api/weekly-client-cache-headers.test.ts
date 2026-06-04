import { describe, expect, it, vi } from 'vitest'
import { fetchWeeklySnapshot } from '~/shared/api'

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

const createWeeklyPayload = () => ({
  week: {
    id: '2026-W17',
    seed: 1234567890,
    release: '2026-04-16T11:00:00.000Z',
    expiration: '2026-04-23T11:00:00.000Z',
  },
  dives: {
    normal: {
      name: 'Crystal Routes',
      biome: 'AzureWeald' as const,
      missions: [createMission(), createMission(), createMission()],
    },
    elite: {
      name: 'Lethal Depths',
      biome: 'GlacialStrata' as const,
      missions: [createMission(), createMission(), createMission()],
    },
  },
})

describe('fetchWeeklySnapshot cache headers', () => {
  it('does not expose service worker cache headers as payload source hints', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(createWeeklyPayload()), {
        status: 200,
        headers: {
          'content-type': 'application/json',
          'x-drg-sw-cache-status': 'cache',
        },
      }),
    )

    const result = await fetchWeeklySnapshot({
      fetch: fetchImpl,
      request: 'https://example.test/api/v1/weekly',
    })

    expect(result.week.id).toBe('2026-W17')
    expect('source' in result).toBe(false)
    expect(fetchImpl).toHaveBeenCalledOnce()
  })
})
