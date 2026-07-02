import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent } from '@solidjs/testing-library'
import type { Briefing } from '~/shared/api'
import { renderWithProviders } from '~test/render'
import { BriefingPage } from './BriefingPage'

// createBriefingQuery (model/create-briefing-query.ts) talks to the
// network through the global `fetch` and to an on-device cache through the
// Cache Storage API. jsdom does not implement Cache Storage, so the cache
// layer is already a no-op here (`caches` is undefined) — only `fetch` needs
// stubbing to drive the page through its Loading/Errored/ready states.
// Relative to the real host clock (not pinned): BriefingPage reads `new Date()`
// directly for its expiry check, so a fixed past timestamp here would make
// the briefing silently render expired once that date passes.
const oneWeekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

const BRIEFING: Briefing = {
  seed: 1,
  confidence: 'verified',
  release: new Date().toISOString(),
  expiration: oneWeekFromNow,
  dives: {
    normal: {
      name: 'Awful Catacomb',
      biome: 'FungusBogs',
      // The contract pins every dive to exactly three stages.
      missions: [
        {
          primaryObjective: { kind: 'EggHunt', eggs: 6 },
          secondaryObjective: { kind: 'MiningExpedition', morkite: 150 },
          warning: null,
          anomaly: null,
        },
        {
          primaryObjective: { kind: 'SalvageOperation', miniMules: 3 },
          secondaryObjective: { kind: 'DeepScan', resonanceCrystals: 2 },
          warning: null,
          anomaly: null,
        },
        {
          primaryObjective: { kind: 'MiningExpedition', morkite: 200 },
          secondaryObjective: { kind: 'Blackbox', blackBoxes: 1 },
          warning: null,
          anomaly: null,
        },
      ],
    },
    elite: {
      name: 'Natural Roof',
      biome: 'DenseBiozone',
      missions: [
        {
          primaryObjective: { kind: 'DeepScan', resonanceCrystals: 5 },
          secondaryObjective: { kind: 'Blackbox', blackBoxes: 1 },
          warning: null,
          anomaly: null,
        },
        {
          primaryObjective: { kind: 'EscortDuty', refuels: 2 },
          secondaryObjective: { kind: 'EggHunt', eggs: 2 },
          warning: null,
          anomaly: null,
        },
        {
          primaryObjective: { kind: 'PointExtraction', aquarqs: 10 },
          secondaryObjective: { kind: 'HeavyExtraction', resiniteMasses: 1 },
          warning: null,
          anomaly: null,
        },
      ],
    },
  },
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}

function renderBriefingPage(dockVisible: boolean) {
  return renderWithProviders(() => <BriefingPage dockVisible={dockVisible} onUpdateApp={() => {}} />)
}

describe('BriefingPage', () => {
  let realFetch: typeof fetch

  beforeEach(() => {
    realFetch = globalThis.fetch
  })

  afterEach(() => {
    globalThis.fetch = realFetch
    vi.restoreAllMocks()
  })

  it('sets the document title immediately, then loads the briefing', async () => {
    globalThis.fetch = vi.fn(async () => jsonResponse(BRIEFING))

    const { findByText } = renderBriefingPage(false)

    expect(document.title).toBe('Hoxxes Briefing | DRG Deep Dive Overview')
    expect(await findByText('Awful Catacomb')).toBeInTheDocument()
  })

  it('shows the error state on a failed request and retries on demand', async () => {
    const fetchMock = vi.fn(async () => jsonResponse(BRIEFING))
    fetchMock.mockRejectedValueOnce(new TypeError('network down'))
    globalThis.fetch = fetchMock
    // BriefingPage logs the caught boundary error (BriefingPage.tsx) — expected
    // here since this test deliberately rejects the request. Spy it so the
    // run stays quiet, but still assert it actually fired.
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { findByText, findByRole } = renderBriefingPage(false)

    expect(await findByText('Could not load the briefing')).toBeInTheDocument()
    expect(errorSpy).toHaveBeenCalledWith('ErrorBoundary', expect.anything())

    fireEvent.click(await findByRole('button', { name: 'Try again' }))

    expect(await findByText('Awful Catacomb')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('shows the update wall on 410 CONTRACT_RETIRED and wires the update action', async () => {
    globalThis.fetch = vi.fn(async () =>
      jsonResponse({ code: 'CONTRACT_RETIRED', message: 'This app version is no longer supported.' }, 410),
    )
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const onUpdateApp = vi.fn()

    const { findByText, findByRole } = renderWithProviders(() => (
      <BriefingPage dockVisible={false} onUpdateApp={onUpdateApp} />
    ))

    expect(await findByText('A new version is available')).toBeInTheDocument()

    fireEvent.click(await findByRole('button', { name: 'Update app' }))
    expect(onUpdateApp).toHaveBeenCalledOnce()
  })

  it('replaces a loaded board with the update wall when a refresh returns CONTRACT_RETIRED', async () => {
    const fetchMock = vi.fn(async () => jsonResponse(BRIEFING))
    globalThis.fetch = fetchMock
    const onUpdateApp = vi.fn()

    const { findByText, findByRole } = renderWithProviders(() => (
      <BriefingPage dockVisible={false} onUpdateApp={onUpdateApp} />
    ))

    expect(await findByText('Awful Catacomb')).toBeInTheDocument()

    fetchMock.mockImplementation(async () =>
      jsonResponse({ code: 'CONTRACT_RETIRED', message: 'This app version is no longer supported.' }, 410),
    )
    fireEvent.click(await findByRole('button', { name: 'Refresh' }))

    expect(await findByText('A new version is available')).toBeInTheDocument()

    fireEvent.click(await findByRole('button', { name: 'Update app' }))
    expect(onUpdateApp).toHaveBeenCalledOnce()
  })

  it('renders the unverified-briefing advisory over normal data', async () => {
    globalThis.fetch = vi.fn(async () => jsonResponse({ ...BRIEFING, confidence: 'unverified' }))

    const { findByText } = renderBriefingPage(false)

    expect(await findByText('Awful Catacomb')).toBeInTheDocument()
    expect(await findByText('Unverified briefing')).toBeInTheDocument()
  })
})
