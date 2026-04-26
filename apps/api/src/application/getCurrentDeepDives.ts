import type { DeepDivesProvider } from '../ports/deepDivesProvider.ts'
import type { CurrentDeepDives } from './models/currentDeepDives.ts'

export const getCurrentDeepDives = (provider: DeepDivesProvider): Promise<CurrentDeepDives> => {
  return provider.getCurrentDeepDives()
}
