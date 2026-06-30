import { afterEach, describe, expect, it, vi } from 'vitest'
import { flush } from 'solid-js'
import { renderHook } from '@solidjs/testing-library'
import type { JSX } from '@solidjs/web'
import * as v from 'valibot'
import { AppCapabilitiesProvider } from './app-capabilities'
import { createLocalStorage, parseStoredValue } from './create-local-storage'

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

describe('createLocalStorage', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('starts undefined when the key is unset', () => {
    const { result } = renderHook(() => createLocalStorage('dive-kind', schema))
    const [value] = result

    expect(value()).toBeUndefined()
  })

  it('reads an existing value on init, namespaced under the app prefix', () => {
    localStorage.setItem('hoxxes-briefing-dive-kind', '"elite"')

    const { result } = renderHook(() => createLocalStorage('dive-kind', schema))
    const [value] = result

    expect(value()).toBe('elite')
  })

  it('writes through to localStorage and updates the signal', () => {
    const { result } = renderHook(() => createLocalStorage('dive-kind', schema))
    const [value, set] = result

    set('elite')
    flush()

    expect(value()).toBe('elite')
    expect(localStorage.getItem('hoxxes-briefing-dive-kind')).toBe('"elite"')
  })

  it('neither reads nor writes when the persistence capability is denied', () => {
    localStorage.setItem('hoxxes-briefing-dive-kind', '"elite"')

    const { result } = renderHook(() => createLocalStorage('dive-kind', schema), {
      wrapper: (props: { children?: JSX.Element }) => (
        <AppCapabilitiesProvider capabilities={{ persistence: false }}>{props.children}</AppCapabilitiesProvider>
      ),
    })
    const [value, set] = result

    expect(value()).toBeUndefined()

    set('normal')
    flush()

    expect(value()).toBe('normal')
    expect(localStorage.getItem('hoxxes-briefing-dive-kind')).toBe('"elite"')
  })

  it('keeps the in-memory value when localStorage.setItem throws', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded')
    })

    const { result } = renderHook(() => createLocalStorage('dive-kind', schema))
    const [value, set] = result

    set('elite')
    flush()

    expect(value()).toBe('elite')

    setItem.mockRestore()
  })
})
