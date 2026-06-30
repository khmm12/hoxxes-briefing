import { describe, expect, it } from 'vitest'
import { render } from '@solidjs/testing-library'
import { AppLayout } from '~/shared/ui/layout'

describe('AppLayout', () => {
  it('renders its children inside a <main>', () => {
    const { container, getByText } = render(() => <AppLayout>content</AppLayout>)

    expect(container.querySelector('main')).not.toBeNull()
    expect(getByText('content')).toBeInTheDocument()
  })

  // The dock variant only changes spacing, which jsdom can't observe (no Panda
  // stylesheet). So this just exercises the `dockVisible` branch and asserts the
  // contract that survives without styles: children still render inside <main>.
  it('renders its children with the dock visible', () => {
    const { container, getByText } = render(() => <AppLayout dockVisible={true}>content</AppLayout>)

    expect(container.querySelector('main')).not.toBeNull()
    expect(getByText('content')).toBeInTheDocument()
  })
})
