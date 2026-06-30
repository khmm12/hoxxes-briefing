import { afterEach, describe, expect, it, vi } from 'vitest'
import { createRoot, createSignal, flush } from 'solid-js'

const [needRefresh, setNeedRefresh] = createSignal(false)
const [offlineReady, setOfflineReady] = createSignal(false)
const updateServiceWorker = vi.fn(async () => {})

// vite-plugin-pwa's dev stub for this virtual module returns dead signals
// (no setter wired to a real worker), so the state machine can't be driven
// through it. Mock it with signals the test controls instead.
vi.mock('virtual:pwa-register/solid', () => ({
  useRegisterSW: () => ({
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  }),
}))

describe('createPwaNoticeState', () => {
  afterEach(() => {
    setNeedRefresh(false)
    setOfflineReady(false)
    updateServiceWorker.mockClear()
  })

  it('has no notice until a refresh is needed', async () => {
    const { createPwaNoticeState } = await import('./create-pwa-notice-state')

    createRoot((dispose) => {
      const state = createPwaNoticeState()

      expect(state.notice()).toBeNull()

      dispose()
    })
  })

  it('surfaces a dismissible notice once a refresh is needed', async () => {
    const { createPwaNoticeState } = await import('./create-pwa-notice-state')

    let state: ReturnType<typeof createPwaNoticeState> | undefined
    const dispose = createRoot((dispose) => {
      state = createPwaNoticeState()
      return dispose
    })

    // Writing a signal from inside the owning root counts as a write in an
    // owned scope and throws in dev — drive the signal from outside it, like
    // a real event handler would.
    setNeedRefresh(true)
    flush()

    expect(state?.notice()).toEqual({ dismissible: true })

    dispose()
  })

  it('reloadForUpdate hands off to updateServiceWorker', async () => {
    const { createPwaNoticeState } = await import('./create-pwa-notice-state')

    await createRoot(async (dispose) => {
      const state = createPwaNoticeState()

      await state.reloadForUpdate()

      expect(updateServiceWorker).toHaveBeenCalledWith(true)

      dispose()
    })
  })

  it('dismissInstallHint clears both offlineReady and needRefresh', async () => {
    const { createPwaNoticeState } = await import('./create-pwa-notice-state')

    let state: ReturnType<typeof createPwaNoticeState> | undefined
    const dispose = createRoot((dispose) => {
      state = createPwaNoticeState()
      return dispose
    })

    setNeedRefresh(true)
    setOfflineReady(true)
    flush()

    state?.dismissInstallHint()
    flush()

    expect(needRefresh()).toBe(false)
    expect(offlineReady()).toBe(false)
    expect(state?.notice()).toBeNull()

    dispose()
  })
})
