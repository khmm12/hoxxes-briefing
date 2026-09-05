import { afterEach, expect, it, vi } from 'vitest'
import { activateServiceWorker } from './activate-service-worker'

afterEach(() => vi.useRealTimers())

it('bounds a stalled installation and removes its state listener', async () => {
  vi.useFakeTimers()
  const worker = Object.assign(new EventTarget(), { state: 'installing', postMessage: vi.fn() })
  const remove = vi.spyOn(worker, 'removeEventListener')
  const activation = activateServiceWorker(worker as unknown as ServiceWorker)
  const rejection = expect(activation).rejects.toThrow('activation timed out')

  await vi.advanceTimersByTimeAsync(15_000)
  await rejection
  expect(remove).toHaveBeenCalledWith('statechange', expect.any(Function))
  expect(vi.getTimerCount()).toBe(0)
})

it('cleans up if posting the activation message fails', async () => {
  const cause = new Error('worker disappeared')
  const worker = Object.assign(new EventTarget(), {
    state: 'installed',
    postMessage() {
      throw cause
    },
  })
  const remove = vi.spyOn(worker, 'removeEventListener')

  await expect(activateServiceWorker(worker as unknown as ServiceWorker)).rejects.toMatchObject({ cause })
  expect(remove).toHaveBeenCalledOnce()
})
