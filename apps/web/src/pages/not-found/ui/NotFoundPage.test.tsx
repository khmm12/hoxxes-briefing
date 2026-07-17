import { describe, expect, it } from 'vitest'
import { MemoryRouter, Route } from '@solidjs/router'
import { render } from '@solidjs/testing-library'
import { I18nProvider } from '~/shared/i18n'
import { createTestI18n } from '~test/render'
import { NotFoundPage } from './NotFoundPage'

// NotFoundPage uses <A>, which needs router context — a MemoryRouter wired to a
// single root route stands in for the real app shell.
function renderNotFoundPage() {
  return render(() => (
    <I18nProvider i18n={createTestI18n()}>
      <MemoryRouter root={(props) => <>{props.children}</>}>
        <Route path="/" component={() => <NotFoundPage />} />
      </MemoryRouter>
    </I18nProvider>
  ))
}

describe('NotFoundPage', () => {
  it('renders the not-found copy and a link back to the briefing', () => {
    const { getByText, getByRole } = renderNotFoundPage()

    expect(getByText('Page not found')).toBeInTheDocument()
    expect(getByText('This page is not available here. Head back to the briefing.')).toBeInTheDocument()

    const link = getByRole('link', { name: 'Go to the briefing' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/')
  })

  it('sets the document title and keeps the state out of the index', () => {
    renderNotFoundPage()

    expect(document.title).toBe('Page not found — Hoxxes Briefing')
    expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex')
    expect(document.head.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      'This page is not available here. Head back to the briefing.',
    )
  })
})
