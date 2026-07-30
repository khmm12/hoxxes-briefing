import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createSignal, flush } from 'solid-js'
import { useHref } from '@solidjs/router'
import { fireEvent, render } from '@solidjs/testing-library'
import type { JSX } from '@solidjs/web'
import { createTestI18n } from '~test/render'
import { App } from './App'

// App owns the PWA wiring through this virtual module; drive it with signals
// the test controls, the way create-pwa-controller.test.ts does.
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
// error boundary, PWA dock), not BriefingPage internals — those have their own
// suite. The stub also lets the crash path throw a *real* runtime error
// (not a BriefingRequestError, which BriefingPage's own boundary would swallow)
// so it bubbles to App's AppErrorBoundary, exactly like a genuine crash.
const pageControl = { crash: false }

vi.mock('~/pages/briefing', () => ({
  BriefingPage: (): JSX.Element => {
    if (pageControl.crash) throw new Error('runtime fault')
    return <div data-testid="briefing-page">briefing</div>
  },
}))

vi.mock('~/pages/not-found', () => ({
  NotFoundPage: (): JSX.Element => {
    const homeHref = useHref(() => '/')

    return (
      <div data-testid="not-found-page">
        not found
        <a href={homeHref()}>Go home</a>
      </div>
    )
  },
}))

function setOnline(online: boolean): void {
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(online)
  window.dispatchEvent(new Event(online ? 'online' : 'offline'))
  flush()
}

describe('App', () => {
  beforeEach(() => {
    setNeedRefresh(false)
    setOfflineReady(false)
    pageControl.crash = false
  })

  afterEach(() => {
    window.history.pushState({}, '', '/')
    vi.restoreAllMocks()
    updateServiceWorker.mockClear()
  })

  it('renders the briefing route inside the app layout with no update dock yet', () => {
    const { container, getByTestId, queryByText } = render(() => <App i18n={createTestI18n()} />)

    expect(getByTestId('briefing-page')).toBeInTheDocument()
    expect(container.querySelector('main')).not.toBeNull()
    expect(queryByText('New version ready')).toBeNull()
  })

  it('routes unknown paths to the not-found page', async () => {
    window.history.pushState({}, '', '/does-not-exist')

    const { findByTestId, queryByTestId } = render(() => <App i18n={createTestI18n()} />)

    expect(await findByTestId('not-found-page')).toBeInTheDocument()
    expect(queryByTestId('briefing-page')).toBeNull()
  })

  it('intercepts plain anchors for client-side navigation', async () => {
    window.history.pushState({}, '', '/does-not-exist')

    const { findByTestId, getByRole } = render(() => <App i18n={createTestI18n()} />)

    expect(await findByTestId('not-found-page')).toBeInTheDocument()
    fireEvent.click(getByRole('link', { name: 'Go home' }))

    expect(await findByTestId('briefing-page')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/')
  })

  it('shows the update dock once a refresh is needed while online', () => {
    const { getByText } = render(() => <App i18n={createTestI18n()} />)

    setNeedRefresh(true)
    flush()

    expect(getByText('New version ready')).toBeInTheDocument()
  })

  it('hides the dock again when the app goes offline', () => {
    const { queryByText } = render(() => <App i18n={createTestI18n()} />)

    setNeedRefresh(true)
    flush()
    setOnline(false)

    expect(queryByText('New version ready')).toBeNull()
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
    const reload = vi.spyOn(window.location, 'reload').mockImplementation(() => {})

    const { getByRole } = render(() => <App i18n={createTestI18n()} />)

    fireEvent.click(getByRole('button', { name: 'Reload app' }))

    expect(reload).toHaveBeenCalledOnce()
    expect(updateServiceWorker).not.toHaveBeenCalled()
  })
})
