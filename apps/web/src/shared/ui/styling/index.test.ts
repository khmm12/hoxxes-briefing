import { describe, expect, it } from 'vitest'
import { resolveClass } from '~/shared/ui/styling'

describe('resolveClass', () => {
  it('returns just the resolved style when no class is given', () => {
    const result = resolveClass(undefined, undefined, { color: 'primary' })

    expect(result).toHaveLength(1)
  })

  it('drops a `false` class same as undefined', () => {
    const result = resolveClass(false, undefined, { color: 'primary' })

    expect(result).toHaveLength(1)
  })

  it('appends a single class string after the resolved style', () => {
    const result = resolveClass('extra', undefined, { color: 'primary' }) as unknown[]

    expect(result).toHaveLength(2)
    expect(result[1]).toBe('extra')
  })

  it('spreads an array of classes after the resolved style', () => {
    const result = resolveClass(['one', 'two'], undefined, { color: 'primary' }) as unknown[]

    expect(result).toHaveLength(3)
    expect(result[1]).toBe('one')
    expect(result[2]).toBe('two')
  })

  it('merges the css prop into the resolved style', () => {
    const withoutCssProp = resolveClass(undefined, undefined, { color: 'primary' }) as unknown[]
    const withCssProp = resolveClass(undefined, { color: 'danger' }, { color: 'primary' }) as unknown[]

    expect(withCssProp[0]).not.toBe(withoutCssProp[0])
  })
})
