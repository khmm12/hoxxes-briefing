import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent } from '@solidjs/testing-library'
import type { Briefing, DeepDive, DeepDiveMission } from '~/shared/api'
import { renderWithProviders } from '~test/render'
import { ShareButton } from './ShareButton'

vi.mock('~/shared/lib/share-or-copy', () => ({ shareOrCopy: vi.fn() }))
const { shareOrCopy } = await import('~/shared/lib/share-or-copy')
const mockedShare = vi.mocked(shareOrCopy)

const BRIEFING: Briefing = {
  seed: 1,
  confidence: 'verified',
  release: '2026-07-11T11:00:00.000Z',
  expiration: '2026-07-18T11:00:00.000Z',
  dives: {
    normal: createDive(),
    elite: createDive(),
  },
}

afterEach(() => {
  mockedShare.mockReset()
})

describe('ShareButton', () => {
  it('shares the built briefing text and flashes nothing on the native sheet', async () => {
    mockedShare.mockResolvedValue('shared')
    const { getByRole } = renderWithProviders(() => <ShareButton briefing={BRIEFING} />)
    const button = getByRole('button', { name: 'Share Deep Dives' })

    fireEvent.click(button)
    await flushMicrotasks()

    expect(mockedShare).toHaveBeenCalledOnce()
    expect(mockedShare.mock.calls[0][0]).toContain('Deep Dives')
    expect(button.getAttribute('data-flash')).toBeNull()
  })

  it('announces a clipboard copy behind a success flash', async () => {
    mockedShare.mockResolvedValue('copied')
    const { getByRole, findByText } = renderWithProviders(() => <ShareButton briefing={BRIEFING} />)
    const button = getByRole('button', { name: 'Share Deep Dives' })

    fireEvent.click(button)

    expect(await findByText('Deep Dives copied to clipboard.')).toBeInTheDocument()
    expect(button.getAttribute('data-flash')).toBe('success')
  })

  it('stays silent when the native share sheet is dismissed', async () => {
    mockedShare.mockResolvedValue('dismissed')
    const { getByRole, queryByText } = renderWithProviders(() => <ShareButton briefing={BRIEFING} />)
    const button = getByRole('button', { name: 'Share Deep Dives' })

    fireEvent.click(button)
    await flushMicrotasks()

    expect(button.getAttribute('data-flash')).toBeNull()
    expect(queryByText('Deep Dives copied to clipboard.')).not.toBeInTheDocument()
  })

  it('warns with a danger flash and a retry hint when the copy fails', async () => {
    mockedShare.mockResolvedValue('failed')
    const { getByRole, findByText } = renderWithProviders(() => <ShareButton briefing={BRIEFING} />)
    const button = getByRole('button', { name: 'Share Deep Dives' })

    fireEvent.click(button)

    expect(await findByText("Couldn't copy the Deep Dives — try again.")).toBeInTheDocument()
    expect(button.getAttribute('data-flash')).toBe('danger')
  })

  it('warns with a danger flash when no transport is available', async () => {
    mockedShare.mockResolvedValue('unavailable')
    const { getByRole, findByText } = renderWithProviders(() => <ShareButton briefing={BRIEFING} />)
    const button = getByRole('button', { name: 'Share Deep Dives' })

    fireEvent.click(button)

    expect(await findByText('Sharing is not available on this device.')).toBeInTheDocument()
    expect(button.getAttribute('data-flash')).toBe('danger')
  })
})

function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

function createDive(): DeepDive {
  return {
    name: 'Test Dive',
    biome: 'AzureWeald',
    missions: [createMission(), createMission(), createMission()],
  }
}

function createMission(): DeepDiveMission {
  return {
    primaryObjective: { kind: 'MiningExpedition', morkite: 100 },
    secondaryObjective: { kind: 'EggHunt', eggs: 2 },
    warning: null,
    anomaly: null,
  }
}
