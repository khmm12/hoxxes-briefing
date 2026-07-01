import { describe, expect, it } from 'vitest'
import type { Briefing } from '~/shared/api'
import { createTestI18n, renderWithProviders } from '~test/render'
import type { BoardViewState } from '../model/weekly-page-state'
import { WeeklyCommandRail } from './WeeklyCommandRail'
import { getWeeklySlogan } from './weekly-slogan-copy'

// The rail only reads the briefing's seed (slogan) and timing; the dives are
// exercised by the deck's own suite, so a light cast keeps this focused.
const briefing = {
  seed: 1,
  release: '2026-06-01T11:00:00Z',
  expiration: '2026-06-08T11:00:00Z',
} as unknown as Briefing

const now = new Date('2026-06-02T13:24:00Z')

const liveState: BoardViewState = {
  source: 'network',
  expired: false,
  online: true,
  refreshing: false,
  refreshFailed: false,
}

describe('WeeklyCommandRail', () => {
  it('renders the brand block with the slogan for the current briefing, the countdown, and the refresh control', () => {
    const i18n = createTestI18n()
    const { getByRole, getByText } = renderWithProviders(
      () => <WeeklyCommandRail now={now} state={liveState} briefing={briefing} onRefresh={() => {}} />,
      { i18n },
    )

    expect(getByRole('heading', { name: 'Hoxxes Briefing' })).toBeInTheDocument()
    expect(getByText(getWeeklySlogan(i18n, String(briefing.seed)))).toBeInTheDocument()
    expect(getByText('5d 21h')).toBeInTheDocument()
    expect(getByRole('button', { name: 'Refresh' })).toBeInTheDocument()
  })

  it('shows the countdown as already ended once the board is marked expired', () => {
    const { getByText } = renderWithProviders(() => (
      <WeeklyCommandRail now={now} state={{ ...liveState, expired: true }} briefing={briefing} onRefresh={() => {}} />
    ))

    expect(getByText('already ended')).toBeInTheDocument()
  })
})
