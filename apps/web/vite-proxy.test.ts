import { describe, expect, it } from 'vitest'
import { createWebViteConfig, localApiDevOrigin } from './vite.config'

describe('createWebViteConfig', () => {
  it('proxies same-origin API requests to the local API dev server', () => {
    const apiProxy = createWebViteConfig().server?.proxy?.['/api']

    expect(apiProxy).toMatchObject({
      target: localApiDevOrigin,
    })
  })
})
