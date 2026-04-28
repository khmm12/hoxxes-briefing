import type { DeepDivesProvider } from '../../ports/deep-dives-provider.ts'
import { DeepDivesProviderError } from '../../ports/deep-dives-provider.ts'
import { type GeneratedDeepDives, generateWeeklyDives } from '../generator/generator-bridge.ts'
import { type DeepDiveEvent, getDeepDiveEvent } from '../upstream/get-deep-dive-event.ts'

export type DirectDeepDivesProviderDependencies = {
  loadEvent?: typeof getDeepDiveEvent
  generateFromSeed?: typeof generateWeeklyDives
}

const ensureGeneratedSeed = (event: DeepDiveEvent, generated: GeneratedDeepDives): void => {
  if (event.seed !== generated.seed) {
    throw new DeepDivesProviderError(
      'WEEKLY_DATA_UNAVAILABLE',
      `Generator seed mismatch: event=${event.seed}, generated=${generated.seed}`,
    )
  }
}

const toErrorOptions = (cause: unknown): ErrorOptions | undefined => {
  return cause === undefined ? undefined : { cause }
}

export const createDirectDeepDivesProvider = (
  dependencies: DirectDeepDivesProviderDependencies = {},
): DeepDivesProvider => {
  const loadEvent = dependencies.loadEvent ?? getDeepDiveEvent
  const generateFromSeed = dependencies.generateFromSeed ?? generateWeeklyDives

  return {
    async getCurrentDeepDives() {
      let event: DeepDiveEvent

      try {
        event = await loadEvent()
      } catch (cause) {
        throw new DeepDivesProviderError(
          'UPSTREAM_UNAVAILABLE',
          'Failed to fetch current deep dive event',
          toErrorOptions(cause),
        )
      }

      let generated: GeneratedDeepDives
      try {
        generated = generateFromSeed(event.seed)
      } catch (cause) {
        throw new DeepDivesProviderError(
          'WEEKLY_DATA_UNAVAILABLE',
          'Failed to generate weekly payload from deep dive event',
          toErrorOptions(cause),
        )
      }

      ensureGeneratedSeed(event, generated)

      return {
        seed: event.seed,
        release: event.release,
        expiration: event.expiration,
        dives: generated.dives,
      }
    },
  }
}
