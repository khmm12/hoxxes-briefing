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

  it('removes the exact listeners it registered on dispose', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    const { cleanup } = renderHook(() => createOnlineStatus())
    flush()

    const registered = addSpy.mock.calls.filter(([type]) => type === 'online' || type === 'offline')
    expect(registered).toHaveLength(2)

    cleanup()
    flush()

    // Pin handler identity, not just the event type: a regression that removed
    // the wrong function would still touch both types and slip past.
    for (const [type, handler] of registered) {
      expect(removeSpy).toHaveBeenCalledWith(type, handler)
    }
  })
})
