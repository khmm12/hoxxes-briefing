import { describe, expect, it } from 'vitest'
import type { Briefing } from '~/shared/api'
import { renderWithProviders } from '~test/render'
import { TimingStrip } from './TimingStrip'

type Timing = Pick<Briefing, 'release' | 'expiration'>

const baseTiming: Timing = {
  release: '2026-06-01T11:00:00Z',
  expiration: '2026-06-08T11:00:00Z',
}

const now = new Date('2026-06-02T13:24:00Z')

function expirationAfter(durationMs: number): string {
  return new Date(now.getTime() + durationMs).toISOString()
}

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

describe('TimingStrip', () => {
  it('shows the week range', () => {
    const { container } = renderWithProviders(() => <TimingStrip now={now} expired={false} timing={baseTiming} />)

    expect(container.textContent).toMatch(/Jun.*\d.*\d/)
  })

  it('shows "already ended" once the briefing is marked expired', () => {
    const { getByText } = renderWithProviders(() => (
      <TimingStrip now={now} expired={true} timing={{ ...baseTiming, expiration: expirationAfter(DAY) }} />
    ))

    expect(getByText('already ended')).toBeInTheDocument()
  })

  it('shows "coming soon" once the deadline has actually passed, even before the briefing is marked expired', () => {
    const { getByText } = renderWithProviders(() => (
      <TimingStrip now={now} expired={false} timing={{ ...baseTiming, expiration: expirationAfter(-SECOND) }} />
    ))

    expect(getByText('coming soon')).toBeInTheDocument()
  })

  it('renders days and hours when both remain', () => {
    const { getByText } = renderWithProviders(() => (
      <TimingStrip
        now={now}
        expired={false}
        timing={{ ...baseTiming, expiration: expirationAfter(5 * DAY + 3 * HOUR) }}
      />
    ))

    expect(getByText('5d 3h')).toBeInTheDocument()
  })

  it('renders days and minutes when no whole hours remain', () => {
    const { getByText } = renderWithProviders(() => (
      <TimingStrip
        now={now}
        expired={false}
        timing={{ ...baseTiming, expiration: expirationAfter(5 * DAY + 30 * MINUTE) }}
      />
    ))

    expect(getByText('5d 30m')).toBeInTheDocument()
  })

  it('renders days and seconds when only seconds remain past the day boundary', () => {
    const { getByText } = renderWithProviders(() => (
      <TimingStrip
        now={now}
        expired={false}
        timing={{ ...baseTiming, expiration: expirationAfter(5 * DAY + 20 * SECOND) }}
      />
    ))

    expect(getByText('5d 20s')).toBeInTheDocument()
  })

  it('renders hours and minutes when under a day remains', () => {
    const { getByText } = renderWithProviders(() => (
      <TimingStrip
        now={now}
        expired={false}
        timing={{ ...baseTiming, expiration: expirationAfter(3 * HOUR + 15 * MINUTE) }}
      />
    ))

    expect(getByText('3h 15m')).toBeInTheDocument()
  })

  it('renders hours and seconds when no whole minutes remain', () => {
    const { getByText } = renderWithProviders(() => (
      <TimingStrip
        now={now}
        expired={false}
        timing={{ ...baseTiming, expiration: expirationAfter(3 * HOUR + 10 * SECOND) }}
      />
    ))

    expect(getByText('3h 10s')).toBeInTheDocument()
  })

  it('renders minutes and seconds when under an hour remains', () => {
    const { getByText } = renderWithProviders(() => (
      <TimingStrip
        now={now}
        expired={false}
        timing={{ ...baseTiming, expiration: expirationAfter(5 * MINUTE + 30 * SECOND) }}
      />
    ))

    expect(getByText('5m 30s')).toBeInTheDocument()
  })
})
