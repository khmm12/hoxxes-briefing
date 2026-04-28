import type { CurrentDeepDives } from '../application/models/current-deep-dives.ts'

export type DeepDivesProviderFailureKind = 'UPSTREAM_UNAVAILABLE' | 'WEEKLY_DATA_UNAVAILABLE'

export type DeepDivesProvider = {
  getCurrentDeepDives: () => Promise<CurrentDeepDives>
}

export class DeepDivesProviderError extends Error {
  override readonly name = 'DeepDivesProviderError'
  readonly kind: DeepDivesProviderFailureKind

  constructor(kind: DeepDivesProviderFailureKind, message: string, options?: ErrorOptions) {
    super(message, options)
    this.kind = kind
  }
}
