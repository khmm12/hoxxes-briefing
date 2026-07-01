import { describe, expect, it } from 'vitest'
import { flush } from 'solid-js'
import { fireEvent, within } from '@solidjs/testing-library'
import type { DeepDive } from '~/shared/api'
import { renderWithProviders } from '~test/render'
import { DiveSlab } from './DiveSlab'

const DIVE: DeepDive = {
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
      anomaly: 'LowGravity',
    },
  ],
}

describe('DiveSlab', () => {
  it('renders the dive name, biome, and a stage per mission', () => {
    const { getByText, getAllByText } = renderWithProviders(() => (
      <DiveSlab dive={DIVE} expired={false} kind="normal" />
    ))

    expect(getByText('Awful Catacomb')).toBeInTheDocument()
    expect(getByText('Fungus Bogs')).toBeInTheDocument()
    expect(getAllByText(/Stage \d/)).toHaveLength(2)
  })

  it('renders quick-read chips for the dive’s warnings and anomalies', () => {
    const { getByRole } = renderWithProviders(() => <DiveSlab dive={DIVE} expired={false} kind="normal" />)
    const quickRead = within(getByRole('region', { name: 'Quick read' }))

    expect(quickRead.getByText('Regenerative Bugs')).toBeInTheDocument()
    expect(quickRead.getByText('Low Gravity')).toBeInTheDocument()
  })

  it('omits the quick read section entirely when there are no warnings or anomalies', () => {
    const cleanDive: DeepDive = {
      ...DIVE,
      missions: DIVE.missions.map((mission) => ({ ...mission, warning: null, anomaly: null })),
    }

    const { queryByRole } = renderWithProviders(() => <DiveSlab dive={cleanDive} expired={false} kind="normal" />)

    expect(queryByRole('region', { name: 'Quick read' })).not.toBeInTheDocument()
  })

  it('flags the board as a last known board once expired', () => {
    const { getByText } = renderWithProviders(() => <DiveSlab dive={DIVE} expired={true} kind="normal" />)

    expect(getByText('Last known board')).toBeInTheDocument()
  })

  it('labels the Elite dive distinctly from a normal one', () => {
    const { getByText } = renderWithProviders(() => <DiveSlab dive={DIVE} expired={false} kind="elite" />)

    expect(getByText('Elite Deep Dive')).toBeInTheDocument()
  })

  it('collapses overflow chips behind a toggle and expands them on click', () => {
    const dive: DeepDive = {
      ...DIVE,
      missions: [
        {
          primaryObjective: { kind: 'EggHunt', eggs: 6 },
          secondaryObjective: { kind: 'MiningExpedition', morkite: 150 },
          warning: 'RegenerativeBugs',
          anomaly: 'LowGravity',
        },
        {
          primaryObjective: { kind: 'SalvageOperation', miniMules: 3 },
          secondaryObjective: { kind: 'DeepScan', resonanceCrystals: 2 },
          warning: 'MacteraPlague',
          anomaly: 'VolatileGuts',
        },
        {
          primaryObjective: { kind: 'MiningExpedition', morkite: 200 },
          secondaryObjective: { kind: 'Blackbox', blackBoxes: 1 },
          warning: 'ExploderInfestation',
          anomaly: 'RichAtmosphere',
        },
      ],
    }

    const { getByRole } = renderWithProviders(() => <DiveSlab dive={dive} expired={false} kind="normal" />)
    const quickRead = within(getByRole('region', { name: 'Quick read' }))

    // Mobile breakpoint (no matchMedia match) caps the visible chips at 2,
    // so this 6-chip dive must overflow behind the toggle.
    const toggle = quickRead.getByRole('button', { name: '+4 more' })
    expect(quickRead.queryByText('Low Gravity')).not.toBeInTheDocument()

    fireEvent.click(toggle)
    flush()

    expect(quickRead.getByRole('button', { name: 'Show less' })).toBeInTheDocument()
    expect(quickRead.queryByText('Low Gravity')).toBeInTheDocument()
  })
})
