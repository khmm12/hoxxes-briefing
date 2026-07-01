import { describe, expect, it } from 'vitest'
import { isBriefingExpired } from '~/pages/briefing/model/briefing-page-state'

const now = new Date('2026-04-20T12:00:00.000Z')

describe('isBriefingExpired', () => {
  it('marks an expiration before now as expired', () => {
    expect(isBriefingExpired(new Date('2026-04-20T11:59:59.999Z'), now)).toBe(true)
  })

  it('marks an expiration exactly at now as expired', () => {
    expect(isBriefingExpired(new Date('2026-04-20T12:00:00.000Z'), now)).toBe(true)
  })

  it('keeps a future expiration live', () => {
    expect(isBriefingExpired(new Date('2026-04-20T12:00:00.001Z'), now)).toBe(false)
  })

  it('does not expire an invalid date', () => {
    expect(isBriefingExpired(new Date('invalid'), now)).toBe(false)
  })
})
