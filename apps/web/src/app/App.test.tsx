import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createSignal, flush } from 'solid-js'
import { fireEvent, render } from '@solidjs/testing-library'
import type { JSX } from '@solidjs/web'
import { createTestI18n } from '~test/render'
import { App } from './App'

// App owns the PWA wiring through this virtual module; drive it with signals
// the test controls, the way create-pwa-notice-state.test.ts does.
const [needRefresh, setNeedRefresh] = createSignal(false)
const [offlineReady, setOfflineReady] = createSignal(false)
const updateServiceWorker = vi.fn(async () => {})

vi.mock('virtual:pwa-register/solid', () => ({
  useRegisterSW: () => ({
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  }),
}))

// Stub the routed page: App.test is about App's own wiring (providers, router,
// error boundary, PWA dock), not WeeklyPage internals — those have their own
// suite. The stub also lets the crash path throw a *real* runtime error
// (not a WeeklyRequestError, which WeeklyPage's own boundary would swallow)
// so it bubbles to App's AppErrorBoundary, exactly like a genuine crash.
const pageControl = { crash: false }

vi.mock('~/pages/weekly', () => ({
  WeeklyPage: (props: { dockVisible: boolean }): JSX.Element => {
    if (pageControl.crash) throw new Error('runtime fault')
    return <div data-testid="weekly-page">dock:{String(props.dockVisible)}</div>
  },
}))

vi.mock('~/pages/not-found', () => ({
  NotFoundPage: (props: { dockVisible: boolean }): JSX.Element => (
    <div data-testid="not-found-page">dock:{String(props.dockVisible)}</div>
  ),
}))

function setOnline(online: boolean): void {
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(online)
  window.dispatchEvent(new Event(online ? 'online' : 'offline'))
  flush()
}

// jsdom's window.location.reload is non-configurable, so it can't be spied
// directly (and a Proxy can't mask a non-configurable property). Swap location
// for a plain stand-in whose reads delegate to the real object — the Router
// still resolves the route — while reload() is a spy.
function stubReload(): ReturnType<typeof vi.fn> {
  const reload = vi.fn()
  const realLocation = window.location
  const standIn = {
    get href() {
      return realLocation.href
    },
    get origin() {
      return realLocation.origin
    },
    get pathname() {
      return realLocation.pathname
    },
    get search() {
      return realLocation.search
    },
    get hash() {
      return realLocation.hash
    },
    reload,
    toString: () => realLocation.href,
  }
  Object.defineProperty(window, 'location', { configurable: true, value: standIn })
  locationRestore = () => Object.defineProperty(window, 'location', { configurable: true, value: realLocation })
  return reload
}

let locationRestore: (() => void) | undefined

describe('App', () => {
  beforeEach(() => {
    setNeedRefresh(false)
    setOfflineReady(false)
    pageControl.crash = false
  })

  afterEach(() => {
    locationRestore?.()
    locationRestore = undefined
    window.history.pushState({}, '', '/')
    vi.restoreAllMocks()
    updateServiceWorker.mockClear()
  })

  it('renders the weekly route with the dock hidden until an update is pending', () => {
    const { getByTestId, queryByText } = render(() => <App i18n={createTestI18n()} />)

    expect(getByTestId('weekly-page')).toHaveTextContent('dock:false')
    expect(queryByText('New version ready')).toBeNull()
  })

  it('routes unknown paths to the not-found page', async () => {
    window.history.pushState({}, '', '/does-not-exist')

    const { findByTestId, queryByTestId } = render(() => <App i18n={createTestI18n()} />)

    expect(await findByTestId('not-found-page')).toBeInTheDocument()
    expect(queryByTestId('weekly-page')).toBeNull()
  })

  it('shows the update dock once a refresh is needed while online', () => {
    const { getByTestId, getByText } = render(() => <App i18n={createTestI18n()} />)

    setNeedRefresh(true)
    flush()

    expect(getByText('New version ready')).toBeInTheDocument()
    expect(getByTestId('weekly-page')).toHaveTextContent('dock:true')
  })

  it('hides the dock again when the app goes offline', () => {
    const { getByTestId, queryByText } = render(() => <App i18n={createTestI18n()} />)

    setNeedRefresh(true)
    flush()
    setOnline(false)

    expect(queryByText('New version ready')).toBeNull()
    expect(getByTestId('weekly-page')).toHaveTextContent('dock:false')
  })

  it('hands the update button off to the service worker', () => {
    const { getByRole } = render(() => <App i18n={createTestI18n()} />)

    setNeedRefresh(true)
    flush()

    fireEvent.click(getByRole('button', { name: 'Update app' }))

    expect(updateServiceWorker).toHaveBeenCalledWith(true)
  })

  it('recovers a runtime crash through the waiting worker when an update is pending', () => {
    pageControl.crash = true
    setNeedRefresh(true)
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { getByText, getByRole } = render(() => <App i18n={createTestI18n()} />)

    expect(getByText('App crashed')).toBeInTheDocument()
    expect(errorSpy).toHaveBeenCalledWith('AppErrorBoundary', expect.anything())

    fireEvent.click(getByRole('button', { name: 'Reload app' }))

    expect(updateServiceWorker).toHaveBeenCalledWith(true)
  })

  it('recovers a runtime crash with a hard reload when no update is waiting', () => {
    pageControl.crash = true
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const reload = stubReload()

    const { getByRole } = render(() => <App i18n={createTestI18n()} />)

    fireEvent.click(getByRole('button', { name: 'Reload app' }))

    expect(reload).toHaveBeenCalledOnce()
    expect(updateServiceWorker).not.toHaveBeenCalled()
  })
})
