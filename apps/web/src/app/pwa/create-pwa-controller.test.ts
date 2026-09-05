import { afterEach, describe, expect, it, vi } from 'vitest'
import { createRoot, createSignal, flush } from 'solid-js'
import { createPwaController } from './create-pwa-controller'

const [needRefresh, setNeedRefresh] = createSignal(false)
const [offlineReady, setOfflineReady] = createSignal(false)
const updateServiceWorker = vi.fn(async () => {})
const registrationUpdate = vi.fn(async () => {})
const registerOptions = vi.hoisted(() => vi.fn())
let registration: { update: typeof registrationUpdate; installing?: ServiceWorker; waiting?: ServiceWorker } | undefined

// vite-plugin-pwa's dev stub for this virtual module returns dead signals
// (no setter wired to a real worker), so the state machine can't be driven
// through it. Mock it with signals the test controls instead.
vi.mock('virtual:pwa-register/solid', () => ({
  useRegisterSW: (options?: { immediate?: boolean; onRegisteredSW?: (url: string, registration: unknown) => void }) => {
    registerOptions(options)
    options?.onRegisteredSW?.('/sw.js', registration)

    return {
      needRefresh: [needRefresh, setNeedRefresh],
      offlineReady: [offlineReady, setOfflineReady],
      updateServiceWorker,
    }
  },
}))

describe('createPwaController', () => {
  afterEach(() => {
    setNeedRefresh(false)
    setOfflineReady(false)
    updateServiceWorker.mockClear()
    registrationUpdate.mockClear()
    registerOptions.mockClear()
    registrationUpdate.mockImplementation(async () => {})
    registration = undefined
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('has no notice until a refresh is needed', () => {
    createRoot((dispose) => {
      const state = createPwaController()

      expect(state.notice()).toBeNull()

      dispose()
    })
  })

  it('defers initial registration to the browser load boundary', () => {
    createRoot((dispose) => {
      createPwaController()

      expect(registerOptions).toHaveBeenCalledWith(expect.objectContaining({ immediate: false }))

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

  it('reloadForOutdated reloads when the update check finds no new worker', async () => {
    const reloadSpy = vi.spyOn(window.location, 'reload').mockImplementation(() => {})
    registration = { update: registrationUpdate }

    await createRoot(async (dispose) => {
      const state = createPwaController()

      await state.reloadForOutdated()

      expect(registrationUpdate).toHaveBeenCalledOnce()
      expect(updateServiceWorker).not.toHaveBeenCalled()
      expect(reloadSpy).toHaveBeenCalledOnce()

      dispose()
    })
  })

  it('reloadForOutdated still reloads when the update check fails', async () => {
    const reloadSpy = vi.spyOn(window.location, 'reload').mockImplementation(() => {})
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    registrationUpdate.mockRejectedValue(new Error('offline'))
    registration = { update: registrationUpdate }

    await createRoot(async (dispose) => {
      const state = createPwaController()

      await state.reloadForOutdated()

      expect(reloadSpy).toHaveBeenCalledOnce()
      expect(warnSpy).toHaveBeenCalledOnce()

      dispose()
    })
  })

  it('waits for installation and activation instead of reloading the old shell', async () => {
    const reloadSpy = vi.spyOn(window.location, 'reload').mockImplementation(() => {})
    const worker = new TestWorker('installing')
    registration = { update: registrationUpdate, installing: worker as unknown as ServiceWorker }
    const dispose = createRoot((dispose) => {
      const state = createPwaController()
      queueMicrotask(() => {
        void state.reloadForOutdated()
      })
      return dispose
    })
    await vi.waitFor(() => expect(registrationUpdate).toHaveBeenCalledOnce())
    expect(reloadSpy).not.toHaveBeenCalled()
    expect(worker.postMessage).not.toHaveBeenCalled()

    worker.transition('installed')
    expect(worker.postMessage).toHaveBeenCalledExactlyOnceWith({ type: 'SKIP_WAITING' })
    worker.transition('activating')
    expect(reloadSpy).not.toHaveBeenCalled()
    worker.transition('activated')
    await vi.waitFor(() => expect(reloadSpy).toHaveBeenCalledOnce())

    registerOptions.mock.calls[0][0].onNeedReload()
    expect(reloadSpy).toHaveBeenCalledOnce()
    dispose()
  })

  it('finds the installed registration before the deferred registration callback', async () => {
    const reloadSpy = vi.spyOn(window.location, 'reload').mockImplementation(() => {})
    const worker = new TestWorker('installed')
    const getRegistration = vi.fn().mockResolvedValue({ update: registrationUpdate, waiting: worker })
    vi.stubGlobal('navigator', { serviceWorker: { getRegistration } })
    let state!: ReturnType<typeof createPwaController>
    const dispose = createRoot((dispose) => {
      state = createPwaController()
      return dispose
    })

    const update = state.reloadForOutdated()
    expect(state.reloadForOutdated()).toBe(update)
    await vi.waitFor(() => expect(worker.postMessage).toHaveBeenCalledOnce())
    expect(getRegistration).toHaveBeenCalledOnce()
    expect(reloadSpy).not.toHaveBeenCalled()
    worker.transition('activated')
    await update
    expect(reloadSpy).toHaveBeenCalledOnce()
    dispose()
  })

  it('keeps the wall available for another attempt when installation fails', async () => {
    const reloadSpy = vi.spyOn(window.location, 'reload').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const worker = new TestWorker('redundant')
    registration = { update: registrationUpdate, installing: worker as unknown as ServiceWorker }
    let state!: ReturnType<typeof createPwaController>
    const dispose = createRoot((dispose) => {
      state = createPwaController()
      return dispose
    })

    await state.reloadForOutdated()
    expect(reloadSpy).not.toHaveBeenCalled()
    worker.transition('activated')
    await state.reloadForOutdated()
    expect(reloadSpy).toHaveBeenCalledOnce()
    dispose()
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

class TestWorker extends EventTarget {
  state: ServiceWorkerState
  postMessage = vi.fn()

  constructor(state: ServiceWorkerState) {
    super()
    this.state = state
  }

  transition(state: ServiceWorkerState) {
    this.state = state
    this.dispatchEvent(new Event('statechange'))
  }
}
