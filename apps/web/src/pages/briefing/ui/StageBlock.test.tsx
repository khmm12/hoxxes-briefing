import { describe, expect, it } from 'vitest'
import type { DeepDiveMission } from '~/shared/api'
import { renderWithProviders } from '~test/render'
import { StageBlock } from './StageBlock'

describe('StageBlock', () => {
  it('renders the stage number and both objectives', () => {
    const mission: DeepDiveMission = {
      primaryObjective: { kind: 'Elimination', dreadnoughts: ['Classic', 'Hiveguard', 'Twins'] },
      secondaryObjective: { kind: 'MiningExpedition', morkite: 150 },
      warning: null,
      anomaly: null,
    }

    const { getByText } = renderWithProviders(() => <StageBlock index={0} kind="normal" mission={mission} />)

    expect(getByText('Stage 1')).toBeInTheDocument()
    expect(getByText('Dreadnought x3 (Classic + Hiveguard + Twins)')).toBeInTheDocument()
    expect(getByText('Morkite x150')).toBeInTheDocument()
  })

  it('counts stages from one based on the index prop', () => {
    const mission: DeepDiveMission = {
      primaryObjective: { kind: 'SalvageOperation', miniMules: 3 },
      secondaryObjective: { kind: 'DeepScan', resonanceCrystals: 2 },
      warning: null,
      anomaly: null,
    }

    const { getByText } = renderWithProviders(() => <StageBlock index={2} kind="normal" mission={mission} />)

    expect(getByText('Stage 3')).toBeInTheDocument()
  })

  it('says there is no warning or anomaly when the stage has neither', () => {
    const mission: DeepDiveMission = {
      primaryObjective: { kind: 'SalvageOperation', miniMules: 3 },
      secondaryObjective: { kind: 'DeepScan', resonanceCrystals: 2 },
      warning: null,
      anomaly: null,
    }

    const { getByText, queryByText } = renderWithProviders(() => (
      <StageBlock index={0} kind="normal" mission={mission} />
    ))

    expect(getByText('No warning or anomaly on this stage.')).toBeInTheDocument()
    expect(queryByText('Warning')).not.toBeInTheDocument()
    expect(queryByText('Anomaly')).not.toBeInTheDocument()
  })

  it('renders only the warning when a stage has a warning but no anomaly', () => {
    const mission: DeepDiveMission = {
      primaryObjective: { kind: 'MiningExpedition', morkite: 200 },
      secondaryObjective: { kind: 'Blackbox', blackBoxes: 1 },
      warning: 'ExploderInfestation',
      anomaly: null,
    }

    const { getByText, queryByText } = renderWithProviders(() => (
      <StageBlock index={0} kind="normal" mission={mission} />
    ))

    expect(getByText('Warning')).toBeInTheDocument()
    expect(getByText('Exploder Infestation')).toBeInTheDocument()
    expect(queryByText('Anomaly')).not.toBeInTheDocument()
    expect(queryByText('No warning or anomaly on this stage.')).not.toBeInTheDocument()
  })

  it('renders only the anomaly when a stage has an anomaly but no warning', () => {
    const mission: DeepDiveMission = {
      primaryObjective: { kind: 'SalvageOperation', miniMules: 3 },
      secondaryObjective: { kind: 'DeepScan', resonanceCrystals: 2 },
      warning: null,
      anomaly: 'VolatileGuts',
    }

    const { getByText, queryByText } = renderWithProviders(() => (
      <StageBlock index={0} kind="normal" mission={mission} />
    ))

    expect(getByText('Anomaly')).toBeInTheDocument()
    expect(getByText('Volatile Guts')).toBeInTheDocument()
    expect(queryByText('Warning')).not.toBeInTheDocument()
  })

  it('renders both the warning and anomaly when a stage has both', () => {
    const mission: DeepDiveMission = {
      primaryObjective: { kind: 'Elimination', dreadnoughts: ['Classic', 'Hiveguard', 'Twins'] },
      secondaryObjective: { kind: 'MiningExpedition', morkite: 150 },
      warning: 'MacteraPlague',
      anomaly: 'LowGravity',
    }

    const { getByText } = renderWithProviders(() => <StageBlock index={0} kind="normal" mission={mission} />)

    expect(getByText('Warning')).toBeInTheDocument()
    expect(getByText('Mactera Plague')).toBeInTheDocument()
    expect(getByText('Anomaly')).toBeInTheDocument()
    expect(getByText('Low Gravity')).toBeInTheDocument()
  })
})
