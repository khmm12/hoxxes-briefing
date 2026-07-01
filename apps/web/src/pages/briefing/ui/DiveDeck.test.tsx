import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { flush } from 'solid-js'
import { fireEvent } from '@solidjs/testing-library'
import type { Briefing, DeepDive } from '~/shared/api'
import { renderWithProviders } from '~test/render'
import { DiveDeck } from './DiveDeck'

// Below `md`, createSwipeDeck (src/pages/briefing/lib/create-swipe-deck.ts)
// always instantiates a real Embla Carousel against the viewport/track refs.
// The global ResizeObserver/IntersectionObserver stubs (vitest.setup.ts) let
// it mount without crashing, and the chip-driven `pick()` path works because
// it sets `active` directly rather than waiting on a real measured scroll —
// so the activation state below is covered. The actual swipe gesture and
// settle physics still need real layout (getBoundingClientRect, scroll
// width) jsdom does not provide, and are out of reach here.

function dive(name: string): DeepDive {
  return {
    name,
    biome: 'FungusBogs',
    missions: [
      {
        primaryObjective: { kind: 'EggHunt', eggs: 6 },
        secondaryObjective: { kind: 'MiningExpedition', morkite: 150 },
        warning: null,
        anomaly: null,
      },
    ],
  }
}

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

// `md` and up renders both slides in a static grid with no carousel (see the
// note above), so forcing the breakpoint match keeps this file off Embla
// entirely.
function matchDesktopBreakpoint(): void {
  const realMatchMedia = window.matchMedia
  window.matchMedia = (query: string): MediaQueryList => ({
    ...realMatchMedia(query),
    matches: query.includes('min-width'),
  })
}

describe('DiveDeck · desktop layout (md and up)', () => {
  let restoreMatchMedia: typeof window.matchMedia

  beforeEach(() => {
    restoreMatchMedia = window.matchMedia
    matchDesktopBreakpoint()
  })

  afterEach(() => {
    window.matchMedia = restoreMatchMedia
  })

  it('renders both dive routes at once, with their switch chips', () => {
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
  it('starts on the normal route with the elite slab inert', () => {
    const { container, getByRole } = renderWithProviders(() => <DiveDeck dives={DIVES} expired={false} />)

    expect(getByRole('button', { name: 'Deep Dive' })).toHaveAttribute('aria-current', 'true')
    expect(container.querySelectorAll('article[inert]')).toHaveLength(1)
  })

  it('switches the active route and inert slab when a switch chip is picked', () => {
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
