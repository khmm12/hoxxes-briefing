import { describe, expect, it } from 'vitest'
import { render } from '@solidjs/testing-library'
import { AppLayout } from '~/shared/ui/layout'

describe('AppLayout', () => {
  it('renders its children inside a <main>', () => {
    const { container, getByText } = render(() => <AppLayout>content</AppLayout>)

    expect(container.querySelector('main')).not.toBeNull()
    expect(getByText('content')).toBeInTheDocument()
  })
})
