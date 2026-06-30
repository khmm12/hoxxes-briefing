import { describe, expect, it } from 'vitest'
import type { WeeklySnapshotResult } from '~/shared/api'
import { renderWithProviders } from '~test/render'
import { StageBlock } from './StageBlock'

type WeeklyMission = WeeklySnapshotResult['dives']['normal']['missions'][number]

describe('StageBlock', () => {
  it('renders the stage number and both objectives', () => {
    const mission: WeeklyMission = {
      primaryObjective: { kind: 'Elimination', dreadnoughts: ['Dreadnought', 'Hiveguard', 'Twins'] },
      secondaryObjective: { kind: 'MiningExpedition', morkite: 150 },
      warning: null,
      mutator: null,
    }

    const { getByText } = renderWithProviders(() => <StageBlock index={0} kind="normal" mission={mission} />)

    expect(getByText('Stage 1')).toBeInTheDocument()
    expect(getByText('Dreadnought x3 (Classic + Hiveguard + Twins)')).toBeInTheDocument()
    expect(getByText('Morkite x150')).toBeInTheDocument()
  })

  it('counts stages from one based on the index prop', () => {
    const mission: WeeklyMission = {
      primaryObjective: { kind: 'SalvageOperation', miniMules: 3 },
      secondaryObjective: { kind: 'DeepScan', resonanceCrystals: 2 },
      warning: null,
      mutator: null,
    }

    const { getByText } = renderWithProviders(() => <StageBlock index={2} kind="normal" mission={mission} />)

    expect(getByText('Stage 3')).toBeInTheDocument()
  })

  it('says there is no warning or mutator when the stage has neither', () => {
    const mission: WeeklyMission = {
      primaryObjective: { kind: 'SalvageOperation', miniMules: 3 },
      secondaryObjective: { kind: 'DeepScan', resonanceCrystals: 2 },
      warning: null,
      mutator: null,
    }

    const { getByText, queryByText } = renderWithProviders(() => (
      <StageBlock index={0} kind="normal" mission={mission} />
    ))

    expect(getByText('No warning or mutator on this stage.')).toBeInTheDocument()
    expect(queryByText('Warning')).not.toBeInTheDocument()
    expect(queryByText('Mutator')).not.toBeInTheDocument()
  })

  it('renders only the warning when a stage has a warning but no mutator', () => {
    const mission: WeeklyMission = {
      primaryObjective: { kind: 'MiningExpedition', morkite: 200 },
      secondaryObjective: { kind: 'Blackbox', blackBoxes: 1 },
      warning: 'ExploderInfestation',
      mutator: null,
    }

    const { getByText, queryByText } = renderWithProviders(() => (
      <StageBlock index={0} kind="normal" mission={mission} />
    ))

    expect(getByText('Warning')).toBeInTheDocument()
    expect(getByText('Exploder Infestation')).toBeInTheDocument()
    expect(queryByText('Mutator')).not.toBeInTheDocument()
    expect(queryByText('No warning or mutator on this stage.')).not.toBeInTheDocument()
  })

  it('renders only the mutator when a stage has a mutator but no warning', () => {
    const mission: WeeklyMission = {
      primaryObjective: { kind: 'SalvageOperation', miniMules: 3 },
      secondaryObjective: { kind: 'DeepScan', resonanceCrystals: 2 },
      warning: null,
      mutator: 'VolatileGuts',
    }

    const { getByText, queryByText } = renderWithProviders(() => (
      <StageBlock index={0} kind="normal" mission={mission} />
    ))

    expect(getByText('Mutator')).toBeInTheDocument()
    expect(getByText('Volatile Guts')).toBeInTheDocument()
    expect(queryByText('Warning')).not.toBeInTheDocument()
  })

  it('renders both the warning and mutator when a stage has both', () => {
    const mission: WeeklyMission = {
      primaryObjective: { kind: 'Elimination', dreadnoughts: ['Dreadnought', 'Hiveguard', 'Twins'] },
      secondaryObjective: { kind: 'MiningExpedition', morkite: 150 },
      warning: 'MacteraPlague',
      mutator: 'LowGravity',
    }

    const { getByText } = renderWithProviders(() => <StageBlock index={0} kind="normal" mission={mission} />)

    expect(getByText('Warning')).toBeInTheDocument()
    expect(getByText('Mactera Plague')).toBeInTheDocument()
    expect(getByText('Mutator')).toBeInTheDocument()
    expect(getByText('Low Gravity')).toBeInTheDocument()
  })
})
