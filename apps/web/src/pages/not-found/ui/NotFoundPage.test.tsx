import { describe, expect, it } from 'vitest'
import { createRouter, memoryHistory } from '@solidjs/router'
import { renderWithProviders } from '~test/render'
import { NotFoundPage } from './NotFoundPage'

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

const TestRouter = createRouter({
  routes: [{ path: '*404', component: NotFoundPage }],
  history: memoryHistory('/missing'),
})

function renderNotFoundPage() {
  return renderWithProviders(() => <TestRouter />)
}
