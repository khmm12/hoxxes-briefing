import { describe, expect, it } from 'vitest'
import { BriefingRequestError } from '~/shared/api'
import { renderWithProviders } from '~test/render'
import { BriefingErrorState, BriefingLoadingState } from './BriefingPageStates'

describe('BriefingLoadingState', () => {
  it('tells the user it is pulling fresh deep dives when online', () => {
    const { getByText } = renderWithProviders(() => <BriefingLoadingState online={true} />)

    expect(getByText('Mining Morkite')).toBeInTheDocument()
    expect(getByText('Pulling the latest deep dives now.')).toBeInTheDocument()
  })

  it('points at the on-device lookup when offline', () => {
    const { getByText } = renderWithProviders(() => <BriefingLoadingState online={false} />)

    expect(getByText('Looking for deep dives on your device.')).toBeInTheDocument()
  })
})

describe('BriefingErrorState', () => {
  it('offers a retry on a network failure while online', () => {
    const { getByRole, getByText } = renderWithProviders(() => (
      <BriefingErrorState error={new BriefingRequestError('network', 'test')} online={true} onRetry={() => {}} />
    ))

    expect(getByText('Could not load the briefing')).toBeInTheDocument()
    expect(getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })

  it('explains the cache miss without a retry when offline', () => {
    const { getByText, queryByRole } = renderWithProviders(() => (
      <BriefingErrorState error={new BriefingRequestError('network', 'test')} online={false} onRetry={() => {}} />
    ))

    expect(getByText('No saved briefing')).toBeInTheDocument()
    expect(queryByRole('button')).toBeNull()
  })
})
