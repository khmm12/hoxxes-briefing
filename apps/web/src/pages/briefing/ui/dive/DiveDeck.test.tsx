import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { flush } from 'solid-js'
import { fireEvent } from '@solidjs/testing-library'
import type { Briefing, DeepDive, DeepDiveMission } from '~/shared/api'
import { renderWithProviders } from '~test/render'
import { setViewportWidth, VIEWPORT_WIDTH } from '~test/viewport'
import { DiveDeck } from './DiveDeck'

// Below `md`, createSwipeDeck (src/pages/briefing/lib/create-swipe-deck.ts)
// always instantiates a real Embla Carousel against the viewport/track refs.
// happy-dom supplies ResizeObserver/IntersectionObserver so it mounts without
// crashing, and the chip-driven `pick()` path works because it sets `active`
// directly rather than waiting on a real measured scroll — so the activation
// state below is covered. The actual swipe gesture and settle physics still
// need real layout (getBoundingClientRect, scroll width) happy-dom does not
// provide, and are out of reach here.

const DIVES: Briefing['dives'] = {
  normal: dive('Awful Catacomb'),
  elite: dive('Natural Roof'),
}

// The picked dive kind persists to localStorage (createLocalStorage) so it
// survives reloads — which also means it survives across tests in this file
// unless cleared. Each test should start from the "normal" default.
afterEach(() => {
  localStorage.clear()
})

describe('DiveDeck · desktop layout (md and up)', () => {
  // `md` and up renders both slides in a static grid with no carousel (see the
  // note above), so a desktop-width viewport keeps this file off Embla entirely.
  // The global mobile default (vitest.setup.ts) resets before the next test.
  beforeEach(() => {
    setViewportWidth(VIEWPORT_WIDTH.desktop)
  })

  it('renders both dives at once, with their switch chips', () => {
    const { getByText, getByRole } = renderWithProviders(() => <DiveDeck dives={DIVES} expired={false} />)

    expect(getByText('Awful Catacomb')).toBeInTheDocument()
    expect(getByText('Natural Roof')).toBeInTheDocument()
    expect(getByRole('button', { name: 'Deep Dive' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Elite Deep Dive' })).toBeInTheDocument()
  })

  it('marks neither slab inert once both are shown side by side', () => {
    const { container } = renderWithProviders(() => <DiveDeck dives={DIVES} expired={false} />)

    expect(container.querySelectorAll('article[inert]')).toHaveLength(0)
  })

  it('moves aria-current to the picked chip, even though both slabs stay visible', () => {
    const { getByRole } = renderWithProviders(() => <DiveDeck dives={DIVES} expired={false} />)

    expect(getByRole('button', { name: 'Deep Dive' })).toHaveAttribute('aria-current', 'true')

    fireEvent.click(getByRole('button', { name: 'Elite Deep Dive' }))
    flush()

    expect(getByRole('button', { name: 'Elite Deep Dive' })).toHaveAttribute('aria-current', 'true')
    expect(getByRole('button', { name: 'Deep Dive' })).not.toHaveAttribute('aria-current')
  })
})

describe('DiveDeck · mobile swipe deck (below md)', () => {
  // Below `md` the deck is a real Embla carousel; state the breakpoint here
  // rather than leaning on the suite-wide mobile default.
  beforeEach(() => {
    setViewportWidth(VIEWPORT_WIDTH.mobile)
  })

  it('starts on the normal dive with the elite slab inert', () => {
    const { container, getByRole } = renderWithProviders(() => <DiveDeck dives={DIVES} expired={false} />)

    expect(getByRole('button', { name: 'Deep Dive' })).toHaveAttribute('aria-current', 'true')
    expect(container.querySelectorAll('article[inert]')).toHaveLength(1)
  })

  it('switches the active dive and inert slab when a switch chip is picked', () => {
    const { container, getByRole } = renderWithProviders(() => <DiveDeck dives={DIVES} expired={false} />)

    fireEvent.click(getByRole('button', { name: 'Elite Deep Dive' }))
    flush()

    expect(getByRole('button', { name: 'Elite Deep Dive' })).toHaveAttribute('aria-current', 'true')
    expect(getByRole('button', { name: 'Deep Dive' })).not.toHaveAttribute('aria-current')

    const inertArticles = container.querySelectorAll('article[inert]')
    expect(inertArticles).toHaveLength(1)
    expect(inertArticles[0]).toHaveTextContent('Awful Catacomb')
  })
})

function dive(name: string): DeepDive {
  const mission: DeepDiveMission = {
    primaryObjective: { kind: 'EggHunt', eggs: 6 },
    secondaryObjective: { kind: 'MiningExpedition', morkite: 150 },
    warning: null,
    anomaly: null,
  }

  return {
    name,
    biome: 'FungusBogs',
    missions: [mission, mission, mission],
  }
}
