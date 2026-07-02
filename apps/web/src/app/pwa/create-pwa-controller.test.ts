import { afterEach, describe, expect, it, onTestFinished, vi } from 'vitest'
import { createRoot, createSignal, flush } from 'solid-js'
import { createPwaController } from './create-pwa-controller'

const [needRefresh, setNeedRefresh] = createSignal(false)
const [offlineReady, setOfflineReady] = createSignal(false)
const updateServiceWorker = vi.fn(async () => {})
const registrationUpdate = vi.fn(async () => {})

// vite-plugin-pwa's dev stub for this virtual module returns dead signals
// (no setter wired to a real worker), so the state machine can't be driven
// through it. Mock it with signals the test controls instead.
vi.mock('virtual:pwa-register/solid', () => ({
  useRegisterSW: (options?: { onRegisteredSW?: (url: string, registration: unknown) => void }) => {
    options?.onRegisteredSW?.('/sw.js', { update: registrationUpdate })

    return {
      needRefresh: [needRefresh, setNeedRefresh],
      offlineReady: [offlineReady, setOfflineReady],
      updateServiceWorker,
    }
  },
}))

// jsdom marks `window.location` unforgeable, so `vi.spyOn(location, 'reload')`
// throws — swap the whole object for the test and restore it after.
function stubLocationReload() {
  const originalLocation = window.location
  const reload = vi.fn()

  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...originalLocation, reload },
  })
  onTestFinished(() => {
    Object.defineProperty(window, 'location', { configurable: true, value: originalLocation })
  })

  return reload
}

describe('createPwaController', () => {
  afterEach(() => {
    setNeedRefresh(false)
    setOfflineReady(false)
    updateServiceWorker.mockClear()
    registrationUpdate.mockClear()
    registrationUpdate.mockImplementation(async () => {})
    vi.restoreAllMocks()
  })

  it('has no notice until a refresh is needed', () => {
    createRoot((dispose) => {
      const state = createPwaController()

      expect(state.notice()).toBeNull()

      dispose()
    })
  })

  it('surfaces a dismissible notice once a refresh is needed', () => {
    let state: ReturnType<typeof createPwaController> | undefined
    const dispose = createRoot((dispose) => {
      state = createPwaController()
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
    await createRoot(async (dispose) => {
      const state = createPwaController()

      await state.reloadForUpdate()

      expect(updateServiceWorker).toHaveBeenCalledWith(true)

      dispose()
    })
  })

  it('reloadForOutdated checks for a fresh worker, updates, and always ends in a reload', async () => {
    const reloadSpy = stubLocationReload()

    await createRoot(async (dispose) => {
      const state = createPwaController()

      await state.reloadForOutdated()

      expect(registrationUpdate).toHaveBeenCalledOnce()
      expect(updateServiceWorker).toHaveBeenCalledWith(true)
      // updateServiceWorker resolves without reloading when nothing is
      // waiting — the wall must still end in a reload.
      expect(reloadSpy).toHaveBeenCalledOnce()

      dispose()
    })
  })

  it('reloadForOutdated still reloads when the update check fails', async () => {
    const reloadSpy = stubLocationReload()
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    registrationUpdate.mockRejectedValue(new Error('offline'))

    await createRoot(async (dispose) => {
      const state = createPwaController()

      await state.reloadForOutdated()

      expect(updateServiceWorker).toHaveBeenCalledWith(true)
      expect(reloadSpy).toHaveBeenCalledOnce()
      expect(warnSpy).toHaveBeenCalledOnce()

      dispose()
    })
  })

  it('dismissInstallHint clears both offlineReady and needRefresh', () => {
    let state: ReturnType<typeof createPwaController> | undefined
    const dispose = createRoot((dispose) => {
      state = createPwaController()
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
