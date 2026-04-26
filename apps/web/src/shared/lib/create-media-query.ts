import { type Accessor, createMemo } from 'solid-js'
import { createSubscription } from './create-subscription'

type MediaQuery = Accessor<boolean> & {
  readonly query: string
}

type MediaQueryListLike = Pick<MediaQueryList, 'addEventListener' | 'matches' | 'media' | 'removeEventListener'>

const alwaysWideMediaQuery: MediaQueryListLike = {
  addEventListener() {},
  matches: false,
  media: '',
  removeEventListener() {},
}

export function createMediaQuery(query: string): MediaQuery {
  const mediaQueryList = createMemo(() => {
    return typeof window === 'undefined' ? alwaysWideMediaQuery : window.matchMedia(query)
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
