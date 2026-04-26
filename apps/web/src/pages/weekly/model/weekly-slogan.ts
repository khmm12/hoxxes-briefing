export type WeeklySloganPool<T> = {
  defaultSafe: readonly T[]
  rare: readonly T[]
  secondary: readonly T[]
}

export type WeeklySloganWeights = {
  defaultSafe: number
  rare: number
  secondary: number
}

export const defaultWeeklySloganWeights: WeeklySloganWeights = {
  defaultSafe: 4,
  rare: 1,
  secondary: 2,
}

export function selectWeeklySlogan<T>(
  pool: WeeklySloganPool<T>,
  weekKey: string,
  weights: WeeklySloganWeights = defaultWeeklySloganWeights,
): T {
  const availableCategories = getAvailableCategories(pool)
  if (availableCategories.length === 0) throw new Error('slogan pool should not be empty')

  const weightedCategories = buildWeightedCategoryRing(weights).filter((category) =>
    availableCategories.includes(category),
  )
  const categoryRing = weightedCategories.length > 0 ? weightedCategories : availableCategories
  const category = categoryRing[fastHash(`${weekKey}:category`) % categoryRing.length]

  const phrases = pool[category]
  return phrases[fastHash(`${weekKey}:${category}:phrase`) % phrases.length]
}

function getAvailableCategories<T>(pool: WeeklySloganPool<T>): Array<keyof WeeklySloganPool<T>> {
  return (Object.keys(pool) as Array<keyof WeeklySloganPool<T>>).filter((category) => pool[category].length > 0)
}

function buildWeightedCategoryRing(weights: WeeklySloganWeights): Array<keyof WeeklySloganWeights> {
  return (Object.keys(weights) as Array<keyof WeeklySloganWeights>).flatMap((category) =>
    Array.from({ length: Math.max(1, weights[category]) }, () => category),
  )
}

function fastHash(value: string): number {
  let hash = 2166136261

  for (const character of value) {
    hash ^= character.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}
