import { describe, expect, it } from 'vitest'
import * as v from 'valibot'
import { parseStoredValue } from './create-local-storage'

const schema = v.picklist(['normal', 'elite'])

describe('parseStoredValue', () => {
  it('returns the value when the payload passes the schema', () => {
    expect(parseStoredValue('"elite"', schema)).toBe('elite')
  })

  it('returns undefined for a missing key', () => {
    expect(parseStoredValue(null, schema)).toBeUndefined()
  })

  it('returns undefined for corrupt JSON', () => {
    expect(parseStoredValue('{oops', schema)).toBeUndefined()
  })

  it('returns undefined when the payload fails the schema', () => {
    expect(parseStoredValue('"haz5"', schema)).toBeUndefined()
    expect(parseStoredValue('42', schema)).toBeUndefined()
  })
})
