import type { BriefingProvider } from '../../ports/briefing-provider.ts'
import { BriefingProviderError } from '../../ports/briefing-provider.ts'
import { type GeneratedBriefing, generateBriefing } from '../generator/generator-bridge.ts'
import { type DeepDiveEvent, getDeepDiveEvent } from '../upstream/get-deep-dive-event.ts'

export type DirectBriefingProviderDependencies = {
  loadEvent?: typeof getDeepDiveEvent
  generateFromSeed?: typeof generateBriefing
}

export function createDirectBriefingProvider(dependencies: DirectBriefingProviderDependencies = {}): BriefingProvider {
  const loadEvent = dependencies.loadEvent ?? getDeepDiveEvent
  const generateFromSeed = dependencies.generateFromSeed ?? generateBriefing

  return {
    async getBriefing() {
      let event: DeepDiveEvent

      try {
        event = await loadEvent()
      } catch (cause) {
        console.error(cause)
        throw new BriefingProviderError(
          'UPSTREAM_UNAVAILABLE',
          'Failed to fetch current deep dive event',
          toErrorOptions(cause),
        )
      }

      let generated: GeneratedBriefing
      try {
        generated = generateFromSeed(event.seed)
      } catch (cause) {
        throw new BriefingProviderError(
          'WEEKLY_DATA_UNAVAILABLE',
          'Failed to generate briefing from deep dive event',
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

function toErrorOptions(cause: unknown): ErrorOptions | undefined {
  return cause === undefined ? undefined : { cause }
}

function ensureGeneratedSeed(event: DeepDiveEvent, generated: GeneratedBriefing): void {
  if (event.seed !== generated.seed) {
    throw new BriefingProviderError(
      'WEEKLY_DATA_UNAVAILABLE',
      `Generator seed mismatch: event=${event.seed}, generated=${generated.seed}`,
    )
  }
}
