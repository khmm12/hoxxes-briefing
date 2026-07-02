export type SloganPool<T> = readonly T[]

const PHRASE_PRIME = 2654435761

export function selectSlogan<T>(pool: SloganPool<T>, seed: number): T {
  if (pool.length === 0) throw new Error('slogan pool should not be empty')
  return pool[(Math.imul(seed, PHRASE_PRIME) >>> 0) % pool.length]
}
