import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchWeeklySnapshot, weeklySnapshotUrl } from './weekly-client'

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
})

describe('fetchWeeklySnapshot', () => {
  it('uses the same-origin weekly API path by default', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(createWeeklyPayload()), {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      }),
    )

    await fetchWeeklySnapshot({
      fetch: fetchImpl,
    })

    expect(fetchImpl).toHaveBeenCalledOnce()
    expect(fetchImpl).toHaveBeenCalledWith(
      weeklySnapshotUrl,
      expect.objectContaining({
        headers: {
          accept: 'application/json',
        },
      }),
    )
    expect(weeklySnapshotUrl).toBe('/api/v1/weekly')
  })

  it('throws a typed API error for structured non-2xx responses', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          code: 'UPSTREAM_UNAVAILABLE',
          message: 'Upstream deep dive data is temporarily unavailable.',
          requestId: 'req-123',
        }),
        {
          status: 503,
          headers: {
            'content-type': 'application/json',
          },
        },
      ),
    )

    await expect(
      fetchWeeklySnapshot({
        fetch: fetchImpl,
        request: 'https://example.test/api/v1/weekly',
      }),
    ).rejects.toMatchObject({
      kind: 'api',
      status: 503,
      publicError: {
        code: 'UPSTREAM_UNAVAILABLE',
        requestId: 'req-123',
      },
    })
  })

  it('throws when a success response does not match the contracts package schema', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          week: {
            id: '2026-W17',
            seed: 1234567890,
          },
        }),
        {
          status: 200,
          headers: {
            'content-type': 'application/json',
          },
        },
      ),
    )

    await expect(
      fetchWeeklySnapshot({
        fetch: fetchImpl,
        request: 'https://example.test/api/v1/weekly',
      }),
    ).rejects.toMatchObject({
      kind: 'invalid-payload',
      status: 200,
    })
  })

  it('throws an invalid-payload error when a success body is not valid JSON', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response('<<not json>>', {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      }),
    )

    await expect(fetchWeeklySnapshot({ fetch: fetchImpl })).rejects.toMatchObject({
      kind: 'invalid-payload',
      status: 200,
    })
  })

  it('falls back to a generic API error when a non-2xx body is not a structured error', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ unexpected: true }), {
        status: 500,
        headers: {
          'content-type': 'application/json',
        },
      }),
    )

    await expect(fetchWeeklySnapshot({ fetch: fetchImpl })).rejects.toMatchObject({
      kind: 'api',
      status: 500,
      publicError: undefined,
    })
  })
})
