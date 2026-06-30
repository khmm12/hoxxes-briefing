import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render } from '@solidjs/testing-library'
import type { WeeklySnapshotResult } from '~/shared/api'
import { I18nProvider } from '~/shared/i18n'
import { createTestI18n } from '~test/render'
import { WeeklyPage } from './WeeklyPage'

// createWeeklyBoardQuery (model/create-weekly-board-query.ts) talks to the
// network through the global `fetch` and to an on-device cache through the
// Cache Storage API. jsdom does not implement Cache Storage, so the cache
// layer is already a no-op here (`caches` is undefined) — only `fetch` needs
// stubbing to drive the page through its Loading/Errored/ready states.
// Relative to the real host clock (not pinned): WeeklyPage reads `new Date()`
// directly for its expiry check, so a fixed past timestamp here would make
// the board silently render expired once that date passes.
const oneWeekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

const BOARD: WeeklySnapshotResult = {
  week: {
    id: 'test-week',
    seed: 1,
    release: new Date().toISOString(),
    expiration: oneWeekFromNow,
  },
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
          mutator: null,
        },
        {
          primaryObjective: { kind: 'SalvageOperation', miniMules: 3 },
          secondaryObjective: { kind: 'DeepScan', resonanceCrystals: 2 },
          warning: null,
          mutator: null,
        },
        {
          primaryObjective: { kind: 'MiningExpedition', morkite: 200 },
          secondaryObjective: { kind: 'Blackbox', blackBoxes: 1 },
          warning: null,
          mutator: null,
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
          mutator: null,
        },
        {
          primaryObjective: { kind: 'EscortDuty', refuels: 2 },
          secondaryObjective: { kind: 'EggHunt', eggs: 2 },
          warning: null,
          mutator: null,
        },
        {
          primaryObjective: { kind: 'PointExtraction', aquarqs: 10 },
          secondaryObjective: { kind: 'HeavyExcavation', resiniteMasses: 1 },
          warning: null,
          mutator: null,
        },
      ],
    },
  },
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}

function renderWeeklyPage(dockVisible: boolean) {
  return render(() => (
    <I18nProvider i18n={createTestI18n()}>
      <WeeklyPage dockVisible={dockVisible} />
    </I18nProvider>
  ))
}

describe('WeeklyPage', () => {
  let realFetch: typeof fetch

  beforeEach(() => {
    realFetch = globalThis.fetch
  })

  afterEach(() => {
    globalThis.fetch = realFetch
    vi.restoreAllMocks()
  })

  it('sets the document title immediately, then loads the board', async () => {
    globalThis.fetch = vi.fn(async () => jsonResponse(BOARD))

    const { findByText } = renderWeeklyPage(false)

    expect(document.title).toBe('Hoxxes Briefing | DRG Deep Dive Board')
    expect(await findByText('Awful Catacomb')).toBeInTheDocument()
  })

  it('shows the error state on a failed request and retries on demand', async () => {
    const fetchMock = vi.fn(async () => jsonResponse(BOARD))
    fetchMock.mockRejectedValueOnce(new TypeError('network down'))
    globalThis.fetch = fetchMock
    // WeeklyPage logs the caught boundary error (WeeklyPage.tsx) — expected
    // here since this test deliberately rejects the request. Spy it so the
    // run stays quiet, but still assert it actually fired.
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { findByText, findByRole } = renderWeeklyPage(false)

    expect(await findByText('Could not load the weekly board')).toBeInTheDocument()
    expect(errorSpy).toHaveBeenCalledWith('ErrorBoundary', expect.anything())

    fireEvent.click(await findByRole('button', { name: 'Try again' }))

    expect(await findByText('Awful Catacomb')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
