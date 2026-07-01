import type { Briefing } from '../application/models/briefing.ts'

export type BriefingProviderFailureKind = 'UPSTREAM_UNAVAILABLE' | 'GENERATOR_UNAVAILABLE'

export type BriefingProvider = {
  getBriefing: () => Promise<Briefing>
}

export class BriefingProviderError extends Error {
  override readonly name = 'BriefingProviderError'
  readonly kind: BriefingProviderFailureKind

  constructor(kind: BriefingProviderFailureKind, message: string, options?: ErrorOptions) {
    super(message, options)
    this.kind = kind
  }
}
