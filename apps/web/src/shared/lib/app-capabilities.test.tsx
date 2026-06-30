import { describe, expect, it } from 'vitest'
import { renderHook } from '@solidjs/testing-library'
import type { JSX } from '@solidjs/web'
import { AppCapabilitiesProvider, useAppCapabilities } from './app-capabilities'

describe('useAppCapabilities', () => {
  it('defaults to persistence allowed outside any provider', () => {
    const { result } = renderHook(() => useAppCapabilities())

    expect(result).toEqual({ persistence: true })
  })

  it('applies an explicit denial from the nearest provider', () => {
    const { result } = renderHook(() => useAppCapabilities(), {
      wrapper: (props: { children?: JSX.Element }) => (
        <AppCapabilitiesProvider capabilities={{ persistence: false }}>{props.children}</AppCapabilitiesProvider>
      ),
    })

    expect(result).toEqual({ persistence: false })
  })

  it('inherits unlisted capabilities from an outer provider', () => {
    const { result } = renderHook(() => useAppCapabilities(), {
      wrapper: (props: { children?: JSX.Element }) => (
        <AppCapabilitiesProvider capabilities={{ persistence: false }}>
          <AppCapabilitiesProvider capabilities={{}}>{props.children}</AppCapabilitiesProvider>
        </AppCapabilitiesProvider>
      ),
    })

    expect(result).toEqual({ persistence: false })
  })

  it('lets an inner provider override an outer one', () => {
    const { result } = renderHook(() => useAppCapabilities(), {
      wrapper: (props: { children?: JSX.Element }) => (
        <AppCapabilitiesProvider capabilities={{ persistence: false }}>
          <AppCapabilitiesProvider capabilities={{ persistence: true }}>{props.children}</AppCapabilitiesProvider>
        </AppCapabilitiesProvider>
      ),
    })

    expect(result).toEqual({ persistence: true })
  })
})
