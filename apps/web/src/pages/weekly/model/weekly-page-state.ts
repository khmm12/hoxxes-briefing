import { isBefore, isEqual, isValid } from 'date-fns'

export type BoardViewState = {
  source: 'cache' | 'network'
  expired: boolean
  online: boolean
  refreshing: boolean
  refreshFailed: boolean
}

export function isWeeklyExpired(expiration: Date, now: Date): boolean {
  if (!isValid(expiration)) return false

  return isBefore(expiration, now) || isEqual(expiration, now)
}
