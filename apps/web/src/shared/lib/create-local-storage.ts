import { type Accessor, createSignal } from 'solid-js'
import * as v from 'valibot'
import { useAppCapabilities } from './app-capabilities'

type LocalStorageSignal<T> = [Accessor<T | undefined>, (value: T) => void]

/**
 * Signal backed by a localStorage key (auto-prefixed with the app namespace).
 * The stored payload is untrusted input: it must parse as JSON and pass the
 * schema, otherwise the signal starts `undefined`. Storage access never
 * throws (Safari private mode, quota) — persistence degrades to plain
 * in-memory state.
 *
 * Without the `persistence` capability the signal is in-memory only:
 * localStorage is neither read nor written.
 *
 * No cross-tab sync: the last write wins on the next load.
 */
export function createLocalStorage<TSchema extends v.GenericSchema>(
  key: string,
  schema: TSchema,
): LocalStorageSignal<v.InferOutput<TSchema>> {
  const { persistence } = useAppCapabilities()
  const storageKey = STORAGE_KEY_PREFIX + key
  const [value, setValue] = createSignal<v.InferOutput<TSchema> | undefined>(() =>
    persistence ? readStoredValue(storageKey, schema) : undefined,
  )

  const set = (next: v.InferOutput<TSchema>) => {
    setValue(() => next)
    if (!persistence) return
    try {
      localStorage.setItem(storageKey, JSON.stringify(next))
    } catch {
      // Keep the in-memory value.
    }
  }

  return [value, set]
}

/** Pure parse step: raw localStorage payload → validated value or `undefined`. */
export function parseStoredValue<TSchema extends v.GenericSchema>(
  raw: string | null,
  schema: TSchema,
): v.InferOutput<TSchema> | undefined {
  if (raw == null) return undefined

  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return undefined
  }

  const result = v.safeParse(schema, data)
  return result.success ? result.output : undefined
}

const STORAGE_KEY_PREFIX = 'hoxxes-briefing:'

function readStoredValue<TSchema extends v.GenericSchema>(
  key: string,
  schema: TSchema,
): v.InferOutput<TSchema> | undefined {
  try {
    return parseStoredValue(localStorage.getItem(key), schema)
  } catch {
    return undefined
  }
}
