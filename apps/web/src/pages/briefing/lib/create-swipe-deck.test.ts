import { describe, expect, it, vi } from 'vitest'
import { flush } from 'solid-js'
import { renderHook } from '@solidjs/testing-library'
import { createSwipeDeck } from './create-swipe-deck'

// `enabled = () => false` keeps the embla effect from ever creating an
// instance (early return before `EmblaCarousel(...)`), so the chip-pick
// state machine is exercised without any layout/embla dependency. The
// embla-backed drag/glide/settle behavior is NOT covered here — see the
// refactor note in the test report.
const items = ['biome-1', 'biome-2', 'biome-3'] as const

describe('createSwipeDeck (chip-pick state, embla disabled)', () => {
  it('starts on the first item when no initial value is given', () => {
    const { result } = renderHook(() => createSwipeDeck(items, () => false))

    expect(result.active()).toBe('biome-1')
  })

  it('starts on the given initial item', () => {
    const { result } = renderHook(() => createSwipeDeck(items, () => false, { initial: 'biome-2' }))

    expect(result.active()).toBe('biome-2')
  })

  it('falls back to the first item for an unknown initial value', () => {
    const { result } = renderHook(() =>
      // biome-ignore lint/suspicious/noExplicitAny: simulating a stale persisted value outside the item set
      createSwipeDeck(items, () => false, { initial: 'stale-biome' as any }),
    )

    expect(result.active()).toBe('biome-1')
  })

  it('picking a valid item activates it and notifies onActivate once', () => {
    const onActivate = vi.fn()
    const { result } = renderHook(() => createSwipeDeck(items, () => false, { onActivate }))
    flush()

    result.pick('biome-3')
    flush()

    expect(result.active()).toBe('biome-3')
    expect(onActivate).toHaveBeenCalledExactlyOnceWith('biome-3')
  })

  it('picking the already-active item stays quiet', () => {
    const onActivate = vi.fn()
    const { result } = renderHook(() => createSwipeDeck(items, () => false, { onActivate }))
    flush()

    result.pick('biome-1')
    flush()

    expect(result.active()).toBe('biome-1')
    expect(onActivate).not.toHaveBeenCalled()
  })

  it('picking an unknown item is a no-op', () => {
    const onActivate = vi.fn()
    const { result } = renderHook(() => createSwipeDeck(items, () => false, { onActivate }))
    flush()

    // biome-ignore lint/suspicious/noExplicitAny: exercising the not-found guard
    result.pick('not-a-biome' as any)
    flush()

    expect(result.active()).toBe('biome-1')
    expect(onActivate).not.toHaveBeenCalled()
  })

  it('does not create an embla instance while disabled', () => {
    const { result } = renderHook(() => createSwipeDeck(items, () => false))
    flush()

    // attachViewport/attachTrack still wire refs, but with no embla instance
    // pick() must not throw reaching for `embla.scrollTo`.
    result.attachViewport(document.createElement('div'))
    result.attachTrack(document.createElement('div'))
    flush()

    expect(() => result.pick('biome-2')).not.toThrow()
  })
})
