import type { DeepDivesProvider } from '../ports/deep-dives-provider.ts'
import type { CurrentDeepDives } from './models/current-deep-dives.ts'

export const getCurrentDeepDives = (provider: DeepDivesProvider): Promise<CurrentDeepDives> => {
  return provider.getCurrentDeepDives()
}
