import { describe, expect, it } from 'vitest'
import { render } from '@solidjs/testing-library'
import {
  AlertIcon,
  BriefingUnavailableIcon,
  GlyphIcon,
  MutatorGenericIcon,
  NotFoundIcon,
  ObjectivePrimaryIcon,
  ObjectiveSecondaryIcon,
  OfflineIcon,
  RefreshIcon,
  ShareIcon,
  WarningGenericIcon,
} from '~/shared/ui/icon'

describe('GlyphIcon', () => {
  it('renders an aria-hidden svg carrying the given path', () => {
    const { container } = render(() => <GlyphIcon d="M0 0z" />)

    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24')

    const path = container.querySelector('path')
    expect(path).toHaveAttribute('d', 'M0 0z')
    expect(path).toHaveAttribute('fill', 'currentColor')
  })

  it('applies the given fill-rule to the path', () => {
    const { container } = render(() => <GlyphIcon d="M0 0z" fillRule="evenodd" />)

    expect(container.querySelector('path')).toHaveAttribute('fill-rule', 'evenodd')
  })

  it('leaves fill-rule unset by default', () => {
    const { container } = render(() => <GlyphIcon d="M0 0z" />)

    expect(container.querySelector('path')).not.toHaveAttribute('fill-rule')
  })

  it('forwards native svg attributes such as role', () => {
    const { container } = render(() => <GlyphIcon d="M0 0z" role="img" />)

    expect(container.querySelector('svg')).toHaveAttribute('role', 'img')
  })
})

describe('glyph icon set', () => {
  const icons = [
    RefreshIcon,
    AlertIcon,
    BriefingUnavailableIcon,
    OfflineIcon,
    NotFoundIcon,
    WarningGenericIcon,
    MutatorGenericIcon,
    ObjectivePrimaryIcon,
    ObjectiveSecondaryIcon,
    ShareIcon,
  ]

  it.each(icons.map((Icon) => [Icon.name, Icon] as const))('%s renders a single glyph path', (_name, Icon) => {
    const { container } = render(() => <Icon />)

    const path = container.querySelector('path')
    expect(path).not.toBeNull()
    expect(path?.getAttribute('d')).toBeTruthy()
  })
})
