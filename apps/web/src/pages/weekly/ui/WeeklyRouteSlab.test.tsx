import { describe, expect, it } from 'vitest'
import { flush } from 'solid-js'
import { fireEvent, within } from '@solidjs/testing-library'
import type { WeeklySnapshotResult } from '~/shared/api'
import { renderWithProviders } from '~test/render'
import { WeeklyRouteSlab } from './WeeklyRouteSlab'

type WeeklyDive = WeeklySnapshotResult['dives']['normal']

const DIVE: WeeklyDive = {
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
      mutator: 'LowGravity',
    },
  ],
}

describe('WeeklyRouteSlab', () => {
  it('renders the dive name, biome, and a stage per mission', () => {
    const { getByText, getAllByText } = renderWithProviders(() => (
      <WeeklyRouteSlab dive={DIVE} expired={false} kind="normal" />
    ))

    expect(getByText('Awful Catacomb')).toBeInTheDocument()
    expect(getByText('Fungus Bogs')).toBeInTheDocument()
    expect(getAllByText(/Stage \d/)).toHaveLength(2)
  })

  it('renders quick-read chips for the route’s warnings and mutators', () => {
    const { getByRole } = renderWithProviders(() => <WeeklyRouteSlab dive={DIVE} expired={false} kind="normal" />)
    const routeScan = within(getByRole('region', { name: 'Route scan' }))

    expect(routeScan.getByText('Regenerative Bugs')).toBeInTheDocument()
    expect(routeScan.getByText('Low Gravity')).toBeInTheDocument()
  })

  it('omits the route scan section entirely when there are no warnings or mutators', () => {
    const cleanDive: WeeklyDive = {
      ...DIVE,
      missions: DIVE.missions.map((mission) => ({ ...mission, warning: null, mutator: null })),
    }

    const { queryByRole } = renderWithProviders(() => (
      <WeeklyRouteSlab dive={cleanDive} expired={false} kind="normal" />
    ))

    expect(queryByRole('region', { name: 'Route scan' })).not.toBeInTheDocument()
  })

  it('flags the board as a last known board once expired', () => {
    const { getByText } = renderWithProviders(() => <WeeklyRouteSlab dive={DIVE} expired={true} kind="normal" />)

    expect(getByText('Last known board')).toBeInTheDocument()
  })

  it('labels the Elite route distinctly from a normal one', () => {
    const { getByText } = renderWithProviders(() => <WeeklyRouteSlab dive={DIVE} expired={false} kind="elite" />)

    expect(getByText('Elite Deep Dive')).toBeInTheDocument()
  })

  it('collapses overflow chips behind a toggle and expands them on click', () => {
    const dive: WeeklyDive = {
      ...DIVE,
      missions: [
        {
          primaryObjective: { kind: 'EggHunt', eggs: 6 },
          secondaryObjective: { kind: 'MiningExpedition', morkite: 150 },
          warning: 'RegenerativeBugs',
          mutator: 'LowGravity',
        },
        {
          primaryObjective: { kind: 'SalvageOperation', miniMules: 3 },
          secondaryObjective: { kind: 'DeepScan', resonanceCrystals: 2 },
          warning: 'MacteraPlague',
          mutator: 'VolatileGuts',
        },
        {
          primaryObjective: { kind: 'MiningExpedition', morkite: 200 },
          secondaryObjective: { kind: 'Blackbox', blackBoxes: 1 },
          warning: 'ExploderInfestation',
          mutator: 'RichAtmosphere',
        },
      ],
    }

    const { getByRole } = renderWithProviders(() => <WeeklyRouteSlab dive={dive} expired={false} kind="normal" />)
    const routeScan = within(getByRole('region', { name: 'Route scan' }))

    // Mobile breakpoint (no matchMedia match) caps the visible chips at 2,
    // so this 6-chip route must overflow behind the toggle.
    const toggle = routeScan.getByRole('button', { name: '+4 more' })
    expect(routeScan.queryByText('Low Gravity')).not.toBeInTheDocument()

    fireEvent.click(toggle)
    flush()

    expect(routeScan.getByRole('button', { name: 'Show less' })).toBeInTheDocument()
    expect(routeScan.queryByText('Low Gravity')).toBeInTheDocument()
  })
})
