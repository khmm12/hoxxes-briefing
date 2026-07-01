import { describe, expect, it, vi } from 'vitest'
import { fetchBriefing } from '~/shared/api'

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

const createBriefingPayload = () => ({
  seed: 1234567890,
  release: '2026-04-16T11:00:00.000Z',
  expiration: '2026-04-23T11:00:00.000Z',
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

describe('fetchBriefing cache headers', () => {
  it('does not expose service worker cache headers as payload source hints', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(createBriefingPayload()), {
        status: 200,
        headers: {
          'content-type': 'application/json',
          'x-drg-sw-cache-status': 'cache',
        },
      }),
    )

    const result = await fetchBriefing({
      fetch: fetchImpl,
      request: 'https://example.test/api/v1/briefing',
    })

    expect(result.seed).toBe(1234567890)
    expect('source' in result).toBe(false)
    expect(fetchImpl).toHaveBeenCalledOnce()
  })
})
