import { afterEach, describe, expect, it, vi } from 'vitest'
import { BRIEFING_CONTRACT_HEADER, CONTRACT_REV } from '@hoxxes-briefing/contracts'
import { briefingUrl, fetchBriefing } from './briefing-client'

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
  confidence: 'verified',
  release: '2026-04-16T11:00:00.000Z',
  expiration: '2026-04-23T11:00:00.000Z',
  dives: {
    normal: createDive('Crystal Depths'),
    elite: createDive('Lethal Depths'),
  },
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('fetchBriefing', () => {
  it('uses the same-origin briefing API path by default', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(createBriefingPayload()), {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      }),
    )

    await fetchBriefing({
      fetch: fetchImpl,
    })

    expect(fetchImpl).toHaveBeenCalledOnce()
    expect(fetchImpl).toHaveBeenCalledWith(
      briefingUrl,
      expect.objectContaining({
        headers: {
          accept: 'application/json',
          [BRIEFING_CONTRACT_HEADER]: String(CONTRACT_REV),
        },
      }),
    )
    expect(briefingUrl).toBe('/api/v1/briefing')
  })

  it('throws an outdated error on 410 CONTRACT_RETIRED', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ code: 'CONTRACT_RETIRED', message: 'This app version is no longer supported.' }), {
        status: 410,
        headers: { 'content-type': 'application/json' },
      }),
    )

    await expect(fetchBriefing({ fetch: fetchImpl })).rejects.toMatchObject({
      kind: 'outdated',
      status: 410,
      publicError: { code: 'CONTRACT_RETIRED' },
    })
    expect(fetchImpl).toHaveBeenCalledOnce()
  })

  it('treats a bare 410 without a CONTRACT_RETIRED body as a plain API error', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ unexpected: true }), {
        status: 410,
        headers: { 'content-type': 'application/json' },
      }),
    )

    await expect(fetchBriefing({ fetch: fetchImpl })).rejects.toMatchObject({
      kind: 'api',
      status: 410,
    })
  })

  it('throws an outdated error when an unparseable payload comes from a newer revision', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ seed: 'not-a-briefing' }), {
        status: 200,
        headers: {
          'content-type': 'application/json',
          [BRIEFING_CONTRACT_HEADER]: String(CONTRACT_REV + 1),
        },
      }),
    )

    await expect(fetchBriefing({ fetch: fetchImpl })).rejects.toMatchObject({
      kind: 'outdated',
      status: 200,
    })
    expect(fetchImpl).toHaveBeenCalledOnce()
  })

  it('quietly retries once when an unparseable payload comes from a server behind the client', async () => {
    const stalePayload = new Response(JSON.stringify({ seed: 'stale-cdn-window' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
    const freshPayload = new Response(JSON.stringify(createBriefingPayload()), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
    const fetchImpl = vi.fn().mockResolvedValueOnce(stalePayload).mockResolvedValueOnce(freshPayload)

    const briefing = await fetchBriefing({ fetch: fetchImpl })

    expect(briefing.seed).toBe(1234567890)
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })

  it('reports a plain invalid-payload error when the quiet retry fails too', async () => {
    const createStaleResponse = () =>
      new Response(JSON.stringify({ seed: 'stale-cdn-window' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    const fetchImpl = vi.fn().mockImplementation(async () => createStaleResponse())

    await expect(fetchBriefing({ fetch: fetchImpl })).rejects.toMatchObject({
      kind: 'invalid-payload',
      status: 200,
    })
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })

  it('does not retry an unparseable payload from the same revision', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ seed: 'broken-on-our-end' }), {
        status: 200,
        headers: {
          'content-type': 'application/json',
          [BRIEFING_CONTRACT_HEADER]: String(CONTRACT_REV),
        },
      }),
    )

    await expect(fetchBriefing({ fetch: fetchImpl })).rejects.toMatchObject({
      kind: 'invalid-payload',
      status: 200,
    })
    expect(fetchImpl).toHaveBeenCalledOnce()
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
      fetchBriefing({
        fetch: fetchImpl,
        request: 'https://example.test/api/v1/briefing',
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
          seed: 1234567890,
          confidence: 'verified',
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
      fetchBriefing({
        fetch: fetchImpl,
        request: 'https://example.test/api/v1/briefing',
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

    await expect(fetchBriefing({ fetch: fetchImpl })).rejects.toMatchObject({
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

    await expect(fetchBriefing({ fetch: fetchImpl })).rejects.toMatchObject({
      kind: 'api',
      status: 500,
      publicError: undefined,
    })
  })
})
