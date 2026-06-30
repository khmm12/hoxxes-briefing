import { describe, expect, it } from 'vitest'
import type { WeeklySnapshotResult } from '~/shared/api'
import { renderWithProviders } from '~test/render'
import type { WeeklyBoardViewState } from '../model/weekly-page-state'
import { WeeklyBoard } from './WeeklyBoard'

const week: WeeklySnapshotResult['week'] = {
  id: 'playground-week',
  seed: 0xc0ffee,
  release: '2026-06-01T11:00:00Z',
  expiration: '2026-06-08T11:00:00Z',
}

const data: WeeklySnapshotResult = {
  week,
  dives: {
    normal: {
      name: 'Awful Catacomb',
      biome: 'FungusBogs',
      missions: [
        {
          primaryObjective: { kind: 'EggHunt', eggs: 6 },
          secondaryObjective: { kind: 'MiningExpedition', morkite: 150 },
          warning: 'RegenerativeBugs',
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
          warning: 'PitJawColony',
          mutator: null,
        },
      ],
    },
    elite: {
      name: 'Natural Roof',
      biome: 'DenseBiozone',
      missions: [
        {
          primaryObjective: { kind: 'EscortDuty', refuels: 2 },
          secondaryObjective: { kind: 'EggHunt', eggs: 2 },
          warning: 'LethalEnemies',
          mutator: null,
        },
        {
          primaryObjective: { kind: 'DeepScan', resonanceCrystals: 5 },
          secondaryObjective: { kind: 'Blackbox', blackBoxes: 1 },
          warning: null,
          mutator: null,
        },
        {
          primaryObjective: { kind: 'PointExtraction', aquarqs: 10 },
          secondaryObjective: { kind: 'HeavyExcavation', resiniteMasses: 1 },
          warning: 'DuckAndCover',
          mutator: null,
        },
      ],
    },
  },
}

const now = new Date('2026-06-02T13:24:00Z')

const liveState: WeeklyBoardViewState = {
  source: 'network',
  expired: false,
  online: true,
  refreshing: false,
  refreshFailed: false,
}

describe('WeeklyBoard', () => {
  it('composes the rail, the route deck, and the footer for the current snapshot', () => {
    const { getByRole, getByText, getAllByText } = renderWithProviders(() => (
      <WeeklyBoard now={now} state={liveState} data={data} onRefresh={() => {}} />
    ))

    // Rail
    expect(getByRole('heading', { name: 'Hoxxes Briefing' })).toBeInTheDocument()

    // Route deck content for both dives
    expect(getByText('Awful Catacomb')).toBeInTheDocument()
    expect(getByText('Natural Roof')).toBeInTheDocument()
    expect(getAllByText('Deep Dive').length).toBeGreaterThan(0)
    expect(getAllByText('Elite Deep Dive').length).toBeGreaterThan(0)

    // Footer
    expect(getAllByText('Rock and Stone!').length).toBeGreaterThan(0)
    expect(getByRole('link', { name: 'Source on GitHub' })).toBeInTheDocument()
  })
})
