import { describe, expect, it } from 'vitest'
import { render } from '@solidjs/testing-library'
import { AppLayout } from '~/shared/ui/layout'

describe('AppLayout', () => {
  it('renders its children inside a <main>', () => {
    const { container, getByText } = render(() => <AppLayout>content</AppLayout>)

    expect(container.querySelector('main')).not.toBeNull()
    expect(getByText('content')).toBeInTheDocument()
  })

  // jsdom never loads the Panda stylesheet, so there is no DOM-observable
  // signal (computed padding, etc.) for the dock variant — this only checks
  // that `dockVisible` selects a different class, not the actual spacing.
  it('selects a different class when the dock is visible', () => {
    const hidden = render(() => <AppLayout>content</AppLayout>)
    const visible = render(() => <AppLayout dockVisible={true}>content</AppLayout>)

    const hiddenMain = hidden.container.querySelector('main')
    const visibleMain = visible.container.querySelector('main')

    expect(hiddenMain?.className).not.toBe(visibleMain?.className)
  })
})
