import { describe, expect, it } from 'vitest'
import { MemoryRouter, Route } from '@solidjs/router'
import { render } from '@solidjs/testing-library'
import { I18nProvider } from '~/shared/i18n'
import { createTestI18n } from '~test/render'
import { NotFoundPage } from './NotFoundPage'

// NotFoundPage uses <A>, which needs router context — a MemoryRouter wired to a
// single root route stands in for the real app shell.
function renderNotFoundPage(dockVisible: boolean) {
  return render(() => (
    <I18nProvider i18n={createTestI18n()}>
      <MemoryRouter root={(props) => <>{props.children}</>}>
        <Route path="/" component={() => <NotFoundPage dockVisible={dockVisible} />} />
      </MemoryRouter>
    </I18nProvider>
  ))
}

describe('NotFoundPage', () => {
  it('renders the not-found copy and a link back to the weekly board', () => {
    const { getByText, getByRole } = renderNotFoundPage(false)

    expect(getByText('Page not found')).toBeInTheDocument()
    expect(getByText('This page is not available here. Head back to the weekly board.')).toBeInTheDocument()

    const link = getByRole('link', { name: 'Go to weekly board' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/')
  })

  it('sets the document title', () => {
    renderNotFoundPage(false)

    expect(document.title).toBe('Hoxxes Briefing | Not Found')
  })
})
