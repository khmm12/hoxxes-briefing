import { createContext, useContext } from 'solid-js'
import type { JSX } from '@solidjs/web'

export type AppCapabilities = {
  /** Whether state may be persisted to durable storage (localStorage). */
  persistence: boolean
}

const DEFAULT_CAPABILITIES: AppCapabilities = {
  persistence: true,
}

type AppCapabilitiesProviderProps = {
  capabilities: Partial<AppCapabilities>
  children?: JSX.Element
}

/**
 * Declares what the app is allowed to do in the current subtree; unlisted
 * capabilities are inherited.
 */
export function AppCapabilitiesProvider(props: AppCapabilitiesProviderProps): JSX.Element {
  const parent = useAppCapabilities()

  return <AppCapabilitiesContext value={{ ...parent, ...props.capabilities }}>{props.children}</AppCapabilitiesContext>
}

export function useAppCapabilities(): AppCapabilities {
  return useContext(AppCapabilitiesContext)
}

const AppCapabilitiesContext = /* @__PURE__ */ createContext(DEFAULT_CAPABILITIES)
