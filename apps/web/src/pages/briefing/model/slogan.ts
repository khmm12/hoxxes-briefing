export type SloganPool<T> = {
  defaultSafe: readonly T[]
  rare: readonly T[]
  secondary: readonly T[]
}

export type SloganWeights = {
  defaultSafe: number
  rare: number
  secondary: number
}

export const defaultSloganWeights: SloganWeights = {
  defaultSafe: 4,
  rare: 1,
  secondary: 2,
}

const PHRASE_PRIME = 2654435761

export function selectSlogan<T>(pool: SloganPool<T>, seed: number, weights: SloganWeights = defaultSloganWeights): T {
  const availableCategories = getAvailableCategories(pool)
  if (availableCategories.length === 0) throw new Error('slogan pool should not be empty')

  const weightedCategories = buildWeightedCategoryRing(weights).filter((category) =>
    availableCategories.includes(category),
  )
  const categoryRing = weightedCategories.length > 0 ? weightedCategories : availableCategories
  const category = categoryRing[seed % categoryRing.length]

  const phrases = pool[category]
  return phrases[(Math.imul(seed, PHRASE_PRIME) >>> 0) % phrases.length]
}

function getAvailableCategories<T>(pool: SloganPool<T>): Array<keyof SloganPool<T>> {
  return (Object.keys(pool) as Array<keyof SloganPool<T>>).filter((category) => pool[category].length > 0)
}

function buildWeightedCategoryRing(weights: SloganWeights): Array<keyof SloganWeights> {
  return (Object.keys(weights) as Array<keyof SloganWeights>).flatMap((category) =>
    Array.from({ length: Math.max(1, weights[category]) }, () => category),
  )
}
