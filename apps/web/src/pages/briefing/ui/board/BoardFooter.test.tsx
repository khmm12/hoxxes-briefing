import { afterEach, describe, expect, it, vi } from 'vitest'
import { flush } from 'solid-js'
import { fireEvent } from '@solidjs/testing-library'
import { renderWithProviders } from '~test/render'
import { BoardFooter } from './BoardFooter'

describe('BoardFooter', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('salutes and credits the author with links out to GitHub', () => {
    const { getByText, getByRole } = renderWithProviders(() => <BoardFooter />)

    expect(getByText('Rock and Stone!')).toBeInTheDocument()

    const author = getByRole('link', { name: 'khmm12' })
    expect(author).toHaveAttribute('href', 'https://github.com/khmm12')
    expect(author).toHaveAttribute('target', '_blank')
    expect(author).toHaveAttribute('rel', 'noopener noreferrer')

    const source = getByRole('link', { name: 'Source on GitHub' })
    expect(source).toHaveAttribute('href', 'https://github.com/khmm12/hoxxes-briefing')

    const beer = getByRole('link', { name: 'Buy me a Blackout Stout' })
    expect(beer).toHaveAttribute('href', 'https://ko-fi.com/khmm12')
    expect(beer).toHaveAttribute('target', '_blank')
    expect(beer).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('cheers the beer glyph on tip click, then settles when the play ends on-screen', () => {
    setVisibility('visible')
    const { getByRole, getByText } = renderWithProviders(() => <BoardFooter />)
    flush()

    const glyph = getByText('🍺')
    const resting = glyph.className

    fireEvent.click(getByRole('link', { name: 'Buy me a Blackout Stout' }))
    flush()
    expect(glyph.className).not.toEqual(resting)

    fireEvent.animationEnd(glyph)
    flush()
    expect(glyph.className).toEqual(resting)
  })

  it('replays the cheer on return when the tip click played while the tab was hidden', () => {
    setVisibility('visible')
    const { getByRole, getByText } = renderWithProviders(() => <BoardFooter />)
    flush()

    const glyph = getByText('🍺')
    const resting = glyph.className

    // Click, then let the play run to completion while the tab is backgrounded.
    fireEvent.click(getByRole('link', { name: 'Buy me a Blackout Stout' }))
    setVisibility('hidden')
    fireEvent.animationEnd(glyph)
    flush()
    expect(glyph.className).toEqual(resting)

    // Coming back into view replays it so the supporter actually sees it.
    setVisibility('visible')
    fireEvent(document, new Event('visibilitychange'))
    flush()
    expect(glyph.className).not.toEqual(resting)
  })

  it('skips the cheer under reduced motion so the state never latches', () => {
    mockReducedMotion()
    const { getByRole, getByText } = renderWithProviders(() => <BoardFooter />)
    flush()

    const glyph = getByText('🍺')
    const resting = glyph.className

    fireEvent.click(getByRole('link', { name: 'Buy me a Blackout Stout' }))
    flush()
    expect(glyph.className).toEqual(resting)
  })
})

function setVisibility(state: DocumentVisibilityState): void {
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue(state)
}

function mockReducedMotion(): void {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query) =>
      ({
        matches: query.includes('prefers-reduced-motion'),
        media: query,
        addEventListener() {},
        removeEventListener() {},
      }) as unknown as MediaQueryList,
  )
}
