import { afterEach, describe, expect, it, vi } from 'vitest'
import { flush } from 'solid-js'
import { renderHook } from '@solidjs/testing-library'
import { createBreakpointQuery, createMediaQuery } from './create-media-query'

afterEach(() => {
  vi.restoreAllMocks()
})

type FakeMediaQueryList = Pick<MediaQueryList, 'addEventListener' | 'matches' | 'removeEventListener'>

function fakeMatchMedia(initialMatches: boolean) {
  const listeners = new Set<() => void>()
  let matches = initialMatches

  const mql: FakeMediaQueryList = {
    addEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
      listeners.add(listener as () => void)
    },
    removeEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
      listeners.delete(listener as () => void)
    },
    get matches() {
      return matches
    },
  }

  return {
    mql: mql as MediaQueryList,
    emit: (next: boolean) => {
      matches = next
      for (const listener of listeners) listener()
    },
    listenerCount: () => listeners.size,
  }
}

describe('createMediaQuery', () => {
  it('exposes the query string used to construct it', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue(fakeMatchMedia(false).mql)

    const { result } = renderHook(() => createMediaQuery('(min-width: 640px)'))

    expect(result.query).toBe('(min-width: 640px)')
  })

  it('seeds the initial value from matchMedia', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue(fakeMatchMedia(true).mql)

    const { result } = renderHook(() => createMediaQuery('(min-width: 640px)'))
    flush()

    expect(result()).toBe(true)
  })

  it('updates when the media query list fires a change event', () => {
    const { mql, emit } = fakeMatchMedia(false)
    vi.spyOn(window, 'matchMedia').mockReturnValue(mql)

    const { result } = renderHook(() => createMediaQuery('(min-width: 640px)'))
    flush()
    expect(result()).toBe(false)

    emit(true)
    flush()

    expect(result()).toBe(true)
  })

  it('removes the change listener on dispose', () => {
    const { mql, listenerCount } = fakeMatchMedia(false)
    vi.spyOn(window, 'matchMedia').mockReturnValue(mql)

    const { cleanup } = renderHook(() => createMediaQuery('(min-width: 640px)'))
    flush()
    expect(listenerCount()).toBe(1)

    cleanup()
    flush()

    expect(listenerCount()).toBe(0)
  })
})

describe('createBreakpointQuery', () => {
  it('builds a min-width query from the Panda breakpoint token', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue(fakeMatchMedia(false).mql)

    const { result } = renderHook(() => createBreakpointQuery('sm'))

    expect(result.query).toBe('(min-width: 640px)')
  })
})
