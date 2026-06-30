import { afterEach, describe, expect, it, vi } from 'vitest'
import { flush } from 'solid-js'
import { renderHook } from '@solidjs/testing-library'
import { createOnlineStatus } from './create-online-status'

const originalOnLine = Object.getOwnPropertyDescriptor(navigator, 'onLine')

afterEach(() => {
  if (originalOnLine) Object.defineProperty(navigator, 'onLine', originalOnLine)
  vi.restoreAllMocks()
})

function setOnLine(value: boolean): void {
  Object.defineProperty(navigator, 'onLine', { configurable: true, value })
}

describe('createOnlineStatus', () => {
  it('seeds from navigator.onLine', () => {
    setOnLine(false)

    const { result } = renderHook(() => createOnlineStatus())
    flush()

    expect(result()).toBe(false)
  })

  it('flips to false when the offline event fires', () => {
    setOnLine(true)

    const { result } = renderHook(() => createOnlineStatus())
    flush()
    expect(result()).toBe(true)

    // Flipping the flag alone doesn't move the signal: it is event-driven,
    // not re-read on every access.
    setOnLine(false)
    flush()
    expect(result()).toBe(true)

    window.dispatchEvent(new Event('offline'))
    flush()

    expect(result()).toBe(false)
  })

  it('flips back to true when the online event fires', () => {
    setOnLine(false)

    const { result } = renderHook(() => createOnlineStatus())
    flush()
    expect(result()).toBe(false)

    setOnLine(true)
    window.dispatchEvent(new Event('online'))
    flush()

    expect(result()).toBe(true)
  })

  it('removes both listeners on dispose', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    const { cleanup } = renderHook(() => createOnlineStatus())
    flush()
    cleanup()
    flush()

    expect(removeSpy.mock.calls.map((call) => call[0]).sort()).toEqual(['offline', 'online'])
  })
})
