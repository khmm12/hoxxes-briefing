import { isBefore, isEqual, isValid, parseISO } from 'date-fns'

export type BoardFreshness = 'cached' | 'live' | 'offline-cache' | 'stale-cache'
export type BoardCommandSlot = 'checking' | 'offline' | 'refresh'
export type BoardStatus =
  | 'cached'
  | 'cached-refresh-failed'
  | 'cached-refreshing'
  | 'live'
  | 'live-refresh-failed'
  | 'live-refreshing'
  | 'offline-cache'
  | 'stale-cache'
  | 'stale-cache-refresh-failed'
export type EmptyBoardState = 'fetch-empty' | 'offline-empty'

export type WeeklyBoardViewState = {
  canRefresh: boolean
  commandSlot: BoardCommandSlot
  freshness: BoardFreshness
  isExpired: boolean
  isRefreshFailed: boolean
}

type DeriveWeeklyBoardStateInput = {
  expiration: string
  now?: Date
  online: boolean
  pending: boolean
  source: 'cache' | 'network'
  isRefreshFailed: boolean
}

export function deriveWeeklyBoardState(input: DeriveWeeklyBoardStateInput): WeeklyBoardViewState {
  const expired = isWeeklyExpired(input.expiration, input.now ?? new Date())
  const freshness = resolveBoardFreshness({
    expired,
    online: input.online,
    source: input.source,
  })

  return {
    canRefresh: input.online && !input.pending,
    commandSlot: resolveCommandSlot(input.online, input.pending),
    freshness,
    isExpired: expired,
    isRefreshFailed: input.isRefreshFailed,
  }
}

export function resolveEmptyBoardState(online: boolean): EmptyBoardState {
  return online ? 'fetch-empty' : 'offline-empty'
}

export function resolveBoardStatus(
  state: Pick<WeeklyBoardViewState, 'commandSlot' | 'freshness' | 'isRefreshFailed'>,
): BoardStatus {
  switch (state.freshness) {
    case 'live':
      return resolveCurrentBoardStatus(state.commandSlot, state.isRefreshFailed)
    case 'cached':
      return resolveCachedBoardStatus(state.commandSlot, state.isRefreshFailed)
    case 'offline-cache':
      return 'offline-cache'
    case 'stale-cache':
      return state.isRefreshFailed ? 'stale-cache-refresh-failed' : 'stale-cache'
  }
}

export function isWeeklyExpired(expiration: string, now: Date = new Date()): boolean {
  const expirationDate = parseISO(expiration)

  if (!isValid(expirationDate)) {
    return false
  }

  return isBefore(expirationDate, now) || isEqual(expirationDate, now)
}

function resolveBoardFreshness(input: {
  expired: boolean
  online: boolean
  source: 'cache' | 'network'
}): BoardFreshness {
  if (input.expired) {
    return 'stale-cache'
  }

  if (!input.online) {
    return 'offline-cache'
  }

  if (input.source === 'cache') {
    return 'cached'
  }

  return 'live'
}

function resolveCurrentBoardStatus(commandSlot: BoardCommandSlot, isRefreshFailed: boolean): BoardStatus {
  if (commandSlot === 'checking') {
    return 'live-refreshing'
  }

  if (isRefreshFailed) {
    return 'live-refresh-failed'
  }

  return 'live'
}

function resolveCachedBoardStatus(commandSlot: BoardCommandSlot, isRefreshFailed: boolean): BoardStatus {
  if (commandSlot === 'checking') {
    return 'cached-refreshing'
  }

  if (isRefreshFailed) {
    return 'cached-refresh-failed'
  }

  return 'cached'
}

function resolveCommandSlot(online: boolean, pending: boolean): BoardCommandSlot {
  if (!online) {
    return 'offline'
  }

  if (pending) {
    return 'checking'
  }

  return 'refresh'
}
