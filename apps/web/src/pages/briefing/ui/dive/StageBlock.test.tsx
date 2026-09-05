import { describe, expect, it } from 'vitest'
import { flush } from 'solid-js'
import { fireEvent } from '@solidjs/testing-library'
import type { DeepDiveMission } from '~/shared/api'
import { renderWithProviders } from '~test/render'
import { buildIntel } from '../../model/intel'
import { StageBlock } from './StageBlock'

// The tooltip panel renders through a `Portal` into `document.body`, outside the
// render container the query helpers scope to — read it straight off the document.
function queryTooltipPanel(): HTMLElement | null {
  return document.body.querySelector('[role="tooltip"]')
}

describe('StageBlock', () => {
  it('renders the stage number and both objectives', () => {
    const mission: DeepDiveMission = {
      primaryObjective: { kind: 'Elimination', dreadnoughts: ['Classic', 'Hiveguard', 'Twins'] },
      secondaryObjective: { kind: 'MiningExpedition', morkite: 150 },
      warning: null,
      anomaly: null,
    }

    const { getByText } = renderWithProviders(() => (
      <StageBlock intel={stageIntel(mission, 0)} index={0} kind="normal" mission={mission} />
    ))

    expect(getByText('Stage 1')).toBeInTheDocument()
    // The Elimination value is tokenized: each named dreadnought variant is its
    // own element (its own tooltip trigger), not a single flat string.
    expect(getByText('Classic')).toBeInTheDocument()
    expect(getByText('Hiveguard')).toBeInTheDocument()
    expect(getByText('Twins')).toBeInTheDocument()
    expect(getByText('Morkite x150')).toBeInTheDocument()
  })

  it('describes a non-Elimination objective value on focus', () => {
    const mission: DeepDiveMission = {
      primaryObjective: { kind: 'MiningExpedition', morkite: 200 },
      secondaryObjective: { kind: 'DeepScan', resonanceCrystals: 2 },
      warning: null,
      anomaly: null,
    }

    const { getByText } = renderWithProviders(() => (
      <StageBlock intel={stageIntel(mission, 0)} index={0} kind="normal" mission={mission} />
    ))

    fireEvent.focusIn(getByText('Morkite x200'))
    flush()

    expect(queryTooltipPanel()).toHaveTextContent(
      'Mine the Morkite quota from the caves and deposit it into the M.U.L.E.',
    )
  })

  it('describes each dreadnought variant on its own token', () => {
    const mission: DeepDiveMission = {
      primaryObjective: { kind: 'Elimination', dreadnoughts: ['Hiveguard'] },
      secondaryObjective: { kind: 'MiningExpedition', morkite: 150 },
      warning: null,
      anomaly: null,
    }

    const { getByText } = renderWithProviders(() => (
      <StageBlock intel={stageIntel(mission, 0)} index={0} kind="normal" mission={mission} />
    ))

    fireEvent.focusIn(getByText('Hiveguard'))
    flush()

    expect(queryTooltipPanel()).toHaveTextContent('Dreadnought variant with Sentinel adds and phased vulnerability.')
  })

  it('counts stages from one based on the index prop', () => {
    const mission: DeepDiveMission = {
      primaryObjective: { kind: 'SalvageOperation', miniMules: 3 },
      secondaryObjective: { kind: 'DeepScan', resonanceCrystals: 2 },
      warning: null,
      anomaly: null,
    }

    const { getByText } = renderWithProviders(() => (
      <StageBlock intel={stageIntel(mission, 2)} index={2} kind="normal" mission={mission} />
    ))

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
      <StageBlock intel={stageIntel(mission, 0)} index={0} kind="normal" mission={mission} />
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
      <StageBlock intel={stageIntel(mission, 0)} index={0} kind="normal" mission={mission} />
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
      <StageBlock intel={stageIntel(mission, 0)} index={0} kind="normal" mission={mission} />
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

    const { getByText } = renderWithProviders(() => (
      <StageBlock intel={stageIntel(mission, 0)} index={0} kind="normal" mission={mission} />
    ))

    expect(getByText('Warning')).toBeInTheDocument()
    expect(getByText('Mactera Plague')).toBeInTheDocument()
    expect(getByText('Anomaly')).toBeInTheDocument()
    expect(getByText('Low Gravity')).toBeInTheDocument()
  })

  it('describes a mutator on its value name (the tooltip trigger moved onto the term)', () => {
    const mission: DeepDiveMission = {
      primaryObjective: { kind: 'SalvageOperation', miniMules: 3 },
      secondaryObjective: { kind: 'DeepScan', resonanceCrystals: 2 },
      warning: 'RegenerativeBugs',
      anomaly: null,
    }

    const { getByText } = renderWithProviders(() => (
      <StageBlock intel={stageIntel(mission, 0)} index={0} kind="normal" mission={mission} />
    ))

    // The tooltip lives on the mutator name, not the surrounding card, so focusing
    // the value text — not the box — is what surfaces the description.
    fireEvent.focusIn(getByText('Regenerative Bugs'))
    flush()

    expect(queryTooltipPanel()).toHaveTextContent(
      'After a few seconds of not taking damage, the creatures will start recovering health.',
    )
  })
})

function stageIntel(mission: DeepDiveMission, index: number) {
  return buildIntel({ name: 'Test Dive', biome: 'AzureWeald', missions: [mission, mission, mission] }, 'normal').stages[
    index
  ]
}
