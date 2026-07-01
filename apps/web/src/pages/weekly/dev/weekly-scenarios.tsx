import type { JSX } from '@solidjs/web'
import type { WeeklySnapshotResult } from '~/shared/api'
import { WeeklyRequestError } from '~/shared/api'
import { AppLayout } from '~/shared/ui/layout'
import { PwaNotice } from '~/widgets/pwa-notice'
import type { BoardViewState } from '../model/weekly-page-state'
import { Board } from '../ui/Board'
import { WeeklyErrorState, WeeklyLoadingState } from '../ui/WeeklyPageStates'

export type WeeklyScenario = {
  id: string
  title: string
  render: () => JSX.Element
}

// A fixed clock keeps countdowns and screenshots deterministic.
const NOW = new Date('2026-06-02T13:24:00Z')

const WEEK: WeeklySnapshotResult['week'] = {
  id: 'playground-week',
  seed: 0xc0ffee,
  release: '2026-06-01T11:00:00Z',
  expiration: '2026-06-08T11:00:00Z',
}

const BOARD: WeeklySnapshotResult = {
  week: WEEK,
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

// Every mutator combination the board layout must survive: warning + mutator
// on one stage, mutator only, an Elimination objective, and enough quick-read
// chips to trigger the overflow control.
const MUTATOR_BOARD: WeeklySnapshotResult = {
  ...BOARD,
  dives: {
    ...BOARD.dives,
    normal: {
      ...BOARD.dives.normal,
      missions: [
        {
          primaryObjective: { kind: 'Elimination', dreadnoughts: ['Dreadnought', 'Hiveguard', 'Twins'] },
          secondaryObjective: { kind: 'MiningExpedition', morkite: 150 },
          warning: 'MacteraPlague',
          mutator: 'LowGravity',
        },
        {
          primaryObjective: { kind: 'SalvageOperation', miniMules: 3 },
          secondaryObjective: { kind: 'DeepScan', resonanceCrystals: 2 },
          warning: null,
          mutator: 'VolatileGuts',
        },
        {
          primaryObjective: { kind: 'MiningExpedition', morkite: 200 },
          secondaryObjective: { kind: 'Blackbox', blackBoxes: 1 },
          warning: 'ExploderInfestation',
          mutator: 'RichAtmosphere',
        },
      ],
    },
  },
}

const LIVE_STATE: BoardViewState = {
  source: 'network',
  expired: false,
  online: true,
  refreshing: false,
  refreshFailed: false,
}

function boardScenario(id: string, title: string, data: WeeklySnapshotResult, state: Partial<BoardViewState>) {
  return {
    id,
    title,
    render: (): JSX.Element => (
      <AppLayout>
        <Board now={NOW} state={{ ...LIVE_STATE, ...state }} data={data} onRefresh={() => {}} />
      </AppLayout>
    ),
  }
}

function errorScenario(id: string, title: string, error: WeeklyRequestError, online = true) {
  return {
    id,
    title,
    render: (): JSX.Element => (
      <WeeklyErrorState dockVisible={false} error={error} online={online} onRetry={() => {}} />
    ),
  }
}

export const weeklyScenarios: WeeklyScenario[] = [
  boardScenario('board', 'Board · live', BOARD, {}),
  boardScenario('board-mutators', 'Board · mutators', MUTATOR_BOARD, {}),
  boardScenario('board-expired', 'Board · expired', BOARD, { expired: true }),
  boardScenario('board-refresh-failed', 'Board · refresh failed', BOARD, { refreshFailed: true }),
  boardScenario('board-refreshing', 'Board · refreshing', BOARD, { refreshing: true }),
  boardScenario('board-offline', 'Board · offline', BOARD, { online: false, source: 'cache' }),
  boardScenario('board-cache', 'Board · from cache', BOARD, { source: 'cache' }),
  {
    id: 'board-update-dock',
    title: 'Board · app update',
    render: (): JSX.Element => (
      <>
        <AppLayout dockVisible>
          <Board now={NOW} state={LIVE_STATE} data={BOARD} onRefresh={() => {}} />
        </AppLayout>
        <PwaNotice onReload={() => {}} />
      </>
    ),
  },
  {
    id: 'loading',
    title: 'Loading',
    render: () => <WeeklyLoadingState dockVisible={false} online={true} />,
  },
  {
    id: 'loading-offline',
    title: 'Loading · offline',
    render: () => <WeeklyLoadingState dockVisible={false} online={false} />,
  },
  errorScenario('error-network', 'Error · network', new WeeklyRequestError('network', 'playground')),
  errorScenario('error-api', 'Error · API', new WeeklyRequestError('api', 'playground')),
  errorScenario('error-offline', 'Error · offline, no cache', new WeeklyRequestError('network', 'playground'), false),
  {
    id: 'crash',
    title: 'Crash (real boundary)',
    render: (): JSX.Element => {
      // Throws for real so the app-level boundary catches it — this exercises
      // the live escalation flow (Try again → Reload app), not a mock screen.
      // Escape by navigating to another scenario URL by hand.
      throw new Error('playground crash')
    },
  },
]
