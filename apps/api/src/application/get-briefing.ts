import type { BriefingProvider } from '../ports/briefing-provider.ts'
import type { Briefing } from './models/briefing.ts'

export function getBriefing(provider: BriefingProvider): Promise<Briefing> {
  return provider.getBriefing()
}
