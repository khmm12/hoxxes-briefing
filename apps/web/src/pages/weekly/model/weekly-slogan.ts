import { getDay, getISOWeek, getISOWeekYear, isBefore, set, subDays, subWeeks } from 'date-fns'

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
): T | undefined {
  const availableCategories = getAvailableCategories(pool)

  if (availableCategories.length === 0) {
    return undefined
  }

  const weightedCategories = buildWeightedCategoryRing(weights).filter((category) =>
    availableCategories.includes(category),
  )
  const categoryRing = weightedCategories.length > 0 ? weightedCategories : availableCategories
  const category = categoryRing[hashString(`${weekKey}:category`) % categoryRing.length]
  const phrases = pool[category]

  if (phrases.length === 0) {
    return undefined
  }

  return phrases[hashString(`${weekKey}:${category}:phrase`) % phrases.length]
}

export function getCurrentWeeklyCycleId(referenceDate: Date = new Date()): string {
  const now = toUtcWallDate(referenceDate)
  const cycleCandidate = set(now, {
    hours: 11,
    milliseconds: 0,
    minutes: 0,
    seconds: 0,
  })
  const daysSinceThursday = (getDay(now) + 7 - 4) % 7
  const cycleStart = subDays(cycleCandidate, daysSinceThursday)
  const resolvedStart = isBefore(now, cycleStart) ? subWeeks(cycleStart, 1) : cycleStart

  return formatWeekId(resolvedStart)
}

function getAvailableCategories<T>(pool: WeeklySloganPool<T>): Array<keyof WeeklySloganPool<T>> {
  return (Object.keys(pool) as Array<keyof WeeklySloganPool<T>>).filter((category) => pool[category].length > 0)
}

function buildWeightedCategoryRing(weights: WeeklySloganWeights): Array<keyof WeeklySloganWeights> {
  return (Object.keys(weights) as Array<keyof WeeklySloganWeights>).flatMap((category) =>
    Array.from({ length: Math.max(1, weights[category]) }, () => category),
  )
}

function hashString(value: string): number {
  let hash = 2166136261

  for (const character of value) {
    hash ^= character.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

function formatWeekId(cycleStart: Date): string {
  return `${getISOWeekYear(cycleStart)}.${String(getISOWeek(cycleStart)).padStart(2, '0')}`
}

function toUtcWallDate(date: Date): Date {
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds(),
  )
}
