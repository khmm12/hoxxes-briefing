import type { JSX } from '@solidjs/web'
import type { Briefing } from '~/shared/api'
import { BriefingRequestError } from '~/shared/api'
import { AppLayout } from '~/shared/ui/layout'
import { PwaNotice } from '~/widgets/pwa-notice'
import type { BriefingViewState } from '../model/briefing-page-state'
import { Board } from '../ui/board/Board'
import { BriefingErrorState, BriefingLoadingState, BriefingOutdatedState } from '../ui/board/BriefingPageStates'

export type Scenario = {
  id: string
  title: string
  render: () => JSX.Element
}

// A fixed clock keeps countdowns and screenshots deterministic.
const NOW = new Date('2026-06-02T13:24:00Z')

const BRIEFING: Briefing = {
  seed: 0xc0ffee,
  confidence: 'verified',
  release: '2026-06-01T11:00:00Z',
  expiration: '2026-06-08T11:00:00Z',
  dives: {
    normal: {
      name: 'Awful Catacomb',
      biome: 'FungusBogs',
      missions: [
        {
          primaryObjective: { kind: 'EggHunt', eggs: 6 },
          secondaryObjective: { kind: 'MiningExpedition', morkite: 150 },
          warning: 'RegenerativeBugs',
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
          warning: 'PitJawColony',
          anomaly: null,
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
          anomaly: null,
        },
        {
          primaryObjective: { kind: 'DeepScan', resonanceCrystals: 5 },
          secondaryObjective: { kind: 'Blackbox', blackBoxes: 1 },
          warning: null,
          anomaly: null,
        },
        {
          primaryObjective: { kind: 'PointExtraction', aquarqs: 10 },
          secondaryObjective: { kind: 'HeavyExtraction', resiniteMasses: 1 },
          warning: 'DuckAndCover',
          anomaly: null,
        },
      ],
    },
  },
}

// Every mutator combination the board layout must survive: warning + anomaly
// on one stage, anomaly only, an Elimination objective, and enough rundown
// chips to trigger the overflow control.
const MUTATOR_BRIEFING: Briefing = {
  ...BRIEFING,
  dives: {
    ...BRIEFING.dives,
    normal: {
      ...BRIEFING.dives.normal,
      missions: [
        {
          primaryObjective: { kind: 'Elimination', dreadnoughts: ['Classic', 'Hiveguard', 'Twins'] },
          secondaryObjective: { kind: 'MiningExpedition', morkite: 150 },
          warning: 'MacteraPlague',
          anomaly: 'LowGravity',
        },
        {
          primaryObjective: { kind: 'SalvageOperation', miniMules: 3 },
          secondaryObjective: { kind: 'DeepScan', resonanceCrystals: 2 },
          warning: null,
          anomaly: 'VolatileGuts',
        },
        {
          primaryObjective: { kind: 'MiningExpedition', morkite: 200 },
          secondaryObjective: { kind: 'Blackbox', blackBoxes: 1 },
          warning: 'ExploderInfestation',
          anomaly: 'RichAtmosphere',
        },
      ],
    },
  },
}

const LIVE_STATE: BriefingViewState = {
  source: 'network',
  expired: false,
  online: true,
  refreshing: false,
  refreshFailed: false,
}

function boardScenario(id: string, title: string, data: Briefing, state: Partial<BriefingViewState>) {
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

function errorScenario(id: string, title: string, error: BriefingRequestError, online = true) {
  return {
    id,
    title,
    render: (): JSX.Element => (
      <BriefingErrorState dockVisible={false} error={error} online={online} onRetry={() => {}} />
    ),
  }
}

export const scenarios: Scenario[] = [
  boardScenario('board', 'Board · live', BRIEFING, {}),
  boardScenario('board-mutators', 'Board · mutators', MUTATOR_BRIEFING, {}),
  boardScenario('board-expired', 'Board · expired', BRIEFING, { expired: true }),
  boardScenario('board-refresh-failed', 'Board · refresh failed', BRIEFING, { refreshFailed: true }),
  boardScenario('board-refreshing', 'Board · refreshing', BRIEFING, { refreshing: true }),
  boardScenario('board-offline', 'Board · offline', BRIEFING, { online: false, source: 'cache' }),
  boardScenario('board-cache', 'Board · from cache', BRIEFING, { source: 'cache' }),
  boardScenario('board-unverified', 'Board · unverified intel', { ...BRIEFING, confidence: 'unverified' }, {}),
  {
    id: 'board-update-dock',
    title: 'Board · app update',
    render: (): JSX.Element => (
      <>
        <AppLayout dockVisible>
          <Board now={NOW} state={LIVE_STATE} data={BRIEFING} onRefresh={() => {}} />
        </AppLayout>
        <PwaNotice onReload={() => {}} />
      </>
    ),
  },
  {
    id: 'loading',
    title: 'Loading',
    render: () => <BriefingLoadingState dockVisible={false} online={true} />,
  },
  {
    id: 'loading-offline',
    title: 'Loading · offline',
    render: () => <BriefingLoadingState dockVisible={false} online={false} />,
  },
  errorScenario('error-network', 'Error · network', new BriefingRequestError('network', 'playground')),
  errorScenario('error-api', 'Error · API', new BriefingRequestError('api', 'playground')),
  errorScenario('error-offline', 'Error · offline, no cache', new BriefingRequestError('network', 'playground'), false),
  {
    id: 'outdated',
    title: 'Outdated · update wall',
    render: () => <BriefingOutdatedState dockVisible={false} onUpdateApp={() => {}} />,
  },
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
