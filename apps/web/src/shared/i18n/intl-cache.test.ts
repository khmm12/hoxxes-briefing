import { describe, expect, it } from 'vitest'
import { getDateTimeFormat } from './intl-cache'

describe('getDateTimeFormat', () => {
  it('returns an Intl.DateTimeFormat for the given locale', () => {
    const format = getDateTimeFormat('en-US')

    expect(format).toBeInstanceOf(Intl.DateTimeFormat)
    expect(format.resolvedOptions().locale).toBe('en-US')
  })

  it('memoizes by locale and options, returning the same instance', () => {
    const first = getDateTimeFormat('en-US', { dateStyle: 'short' })
    const second = getDateTimeFormat('en-US', { dateStyle: 'short' })

    expect(second).toBe(first)
  })

  it('treats a different locale or options as a separate cache entry', () => {
    const base = getDateTimeFormat('en-US', { dateStyle: 'short' })
    const differentLocale = getDateTimeFormat('de-DE', { dateStyle: 'short' })
    const differentOptions = getDateTimeFormat('en-US', { dateStyle: 'long' })

    expect(differentLocale).not.toBe(base)
    expect(differentOptions).not.toBe(base)
  })

  it('normalizes a single locale the same as a one-element array', () => {
    const fromString = getDateTimeFormat('en-US')
    const fromArray = getDateTimeFormat(['en-US'])

    expect(fromArray).toBe(fromString)
  })
})
