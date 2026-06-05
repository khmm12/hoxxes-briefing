import { type Accessor, createMemo } from 'solid-js'
import { type BreakpointToken, token } from 'styled-system/tokens'
import { createSubscription } from './create-subscription'

type MediaQuery = Accessor<boolean> & {
  readonly query: string
}

type Breakpoint = BreakpointToken

/**
 * Matches when the viewport is at or above the Panda breakpoint token,
 * mirroring the same `{ base: …, [breakpoint]: … }` boundary in styles.
 */
export function createBreakpointQuery(breakpoint: Breakpoint): MediaQuery {
  return createMediaQuery(`(min-width: ${token(`breakpoints.${breakpoint}`)})`)
}

type MediaQueryListLike = Pick<MediaQueryList, 'addEventListener' | 'matches' | 'media' | 'removeEventListener'>

// Non-browser fallback: never matches.
const neverMatchingMediaQuery: MediaQueryListLike = {
  addEventListener() {},
  matches: false,
  media: '',
  removeEventListener() {},
}

export function createMediaQuery(query: string): MediaQuery {
  const mediaQueryList = createMemo(() => {
    return typeof window === 'undefined' ? neverMatchingMediaQuery : window.matchMedia(query)
  })

  const val = createSubscription({
    getCurrentValue: ([mq]) => mq.matches,
    deps: () => [mediaQueryList()] as const,
    subscribe(fn, [mq]) {
      mq.addEventListener('change', fn)

      return () => {
        mq.removeEventListener('change', fn)
      }
    },
  })

  const value = (() => val()) as MediaQuery
  Object.defineProperty(value, 'query', {
    get() {
      return query
    },
  })

  return value
}
