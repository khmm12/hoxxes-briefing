import { describe, expect, it, vi } from 'vitest'
import { createEffect, createSignal, flush } from 'solid-js'
import { renderHook } from '@solidjs/testing-library'
import { createSubscription } from './create-subscription'

describe('createSubscription', () => {
  it('subscribes once and seeds the initial value', () => {
    const unsubscribe = vi.fn()
    const subscribe = vi.fn().mockReturnValue(unsubscribe)
    const current = 'a'

    const { result } = renderHook(() =>
      createSubscription({
        getCurrentValue: () => current,
        deps: () => [] as const,
        subscribe,
      }),
    )
    flush()

    expect(result()).toBe('a')
    expect(subscribe).toHaveBeenCalledOnce()
  })

  it('updates the signal when the external store notifies a change', () => {
    let notify: (() => void) | undefined
    let current = 'a'

    const { result } = renderHook(() =>
      createSubscription({
        getCurrentValue: () => current,
        deps: () => [] as const,
        subscribe(fn) {
          notify = fn
          return () => {
            notify = undefined
          }
        },
      }),
    )
    flush()

    current = 'b'
    notify?.()
    flush()

    expect(result()).toBe('b')
  })

  it('unsubscribes on dispose', () => {
    const unsubscribe = vi.fn()

    const { cleanup } = renderHook(() =>
      createSubscription({
        getCurrentValue: () => 0,
        deps: () => [] as const,
        subscribe: () => unsubscribe,
      }),
    )
    flush()

    cleanup()

    expect(unsubscribe).toHaveBeenCalledOnce()
  })

  it('dedupes equal values through the default Object.is identity', () => {
    const runs = vi.fn()
    let notify: (() => void) | undefined
    const current = 1

    // The witnessing effect is created inside the same renderHook root as the
    // subscription, so it shares its owner and is disposed with it — no
    // detached effect left behind after the test.
    renderHook(() => {
      const value = createSubscription({
        getCurrentValue: () => current,
        deps: () => [] as const,
        subscribe(fn) {
          notify = fn
          return () => {}
        },
      })
      createEffect(
        () => value(),
        () => runs(),
      )
      return value
    })
    flush()

    expect(runs).toHaveBeenCalledOnce()

    notify?.()
    flush()

    // Same value, same Object.is identity: no re-run.
    expect(runs).toHaveBeenCalledOnce()
  })

  it('honors a custom identity function instead of Object.is', () => {
    let notify: (() => void) | undefined
    let current = { id: 1 }

    const { result } = renderHook(() =>
      createSubscription({
        getCurrentValue: () => current,
        deps: () => [] as const,
        identity: (a, b) => a.id === b.id,
        subscribe(fn) {
          notify = fn
          return () => {}
        },
      }),
    )
    flush()

    const first = result()
    current = { id: 1 }
    notify?.()
    flush()

    expect(result()).toBe(first)
  })

  it('re-subscribes when deps change', () => {
    const unsubscribeFirst = vi.fn()
    const unsubscribeSecond = vi.fn()
    const subscribe = vi.fn().mockReturnValueOnce(unsubscribeFirst).mockReturnValueOnce(unsubscribeSecond)
    const [dep, setDep] = createSignal('first')

    const { result } = renderHook(() =>
      createSubscription({
        getCurrentValue: ([d]) => d,
        deps: () => [dep()] as const,
        subscribe,
      }),
    )
    flush()

    expect(result()).toBe('first')
    expect(subscribe).toHaveBeenCalledOnce()

    setDep('second')
    flush()

    expect(unsubscribeFirst).toHaveBeenCalledOnce()
    expect(subscribe).toHaveBeenCalledTimes(2)
    expect(result()).toBe('second')
  })
})
