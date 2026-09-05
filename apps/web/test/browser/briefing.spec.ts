import { expect, type Page, test } from '@playwright/test'

test.beforeEach(async ({ request }) => {
  await request.post('/__test/deploy/one')
})

test('updates a retired, controlled app only after the new shell is installed, then works offline', async ({
  page,
  request,
  context,
}) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Bright Ravine' })).toBeVisible()
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })
  await page.reload()
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true)

  await request.post('/__test/retire')
  await page.getByRole('button', { name: 'Refresh', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'A new version is available' })).toBeVisible()
  await request.post('/__test/deploy/two')
  let navigations = 0
  page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame()) navigations++
  })
  await page.getByRole('button', { name: 'Update app', exact: true }).click()
  await expect.poll(async () => (await (await request.get('/__test/status')).json()).heldInstalls).toBe(1)

  // Give an erroneous eager reload time to fire while installation is held.
  await page.waitForTimeout(250)
  expect(navigations).toBe(0)
  await expect(page.locator('meta[name="test-build"]')).toHaveAttribute('content', 'one')
  await expect(page.getByRole('heading', { name: 'A new version is available' })).toBeVisible()

  await request.post('/__test/release-install')
  await expect(page.locator('meta[name="test-build"]')).toHaveAttribute('content', 'two')
  await expect(page.getByRole('heading', { name: 'Bright Ravine' })).toBeVisible()
  expect(navigations).toBe(1)
  await expect.poll(() => page.evaluate(async () => Boolean(await caches.match('/api/v1/briefing')))).toBe(true)

  await context.setOffline(true)
  await page.reload()
  await expect(page.locator('meta[name="test-build"]')).toHaveAttribute('content', 'two')
  await expect(page.getByRole('heading', { name: 'Bright Ravine' })).toBeVisible()
})

test('keeps the mobile switch pinned across restored scroll, font reflow and layout changes', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 568 })
  await page.goto('/')
  const board = page.getByRole('region', { name: 'Deep dive mission board' })
  await expect(board).toBeVisible()
  await page.evaluate(async () => {
    await document.fonts.ready
  })
  const pin = await board.evaluate(($host) => {
    const $bar = $host.firstElementChild
    if (!$bar) throw new Error('Missing dive switch')
    const bleed = Math.max(0, -Number.parseFloat(getComputedStyle($bar).marginBlockStart))
    return $host.getBoundingClientRect().top + window.scrollY - bleed
  })
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), pin + 24)
  await expect.poll(() => progress(page)).toBeCloseTo(0.5, 1)
  await expect
    .poll(() => board.locator('fieldset').evaluate(($bar) => $bar.getBoundingClientRect().top))
    .toBeCloseTo(0, 0)

  await page.reload()
  await expect(board).toBeVisible()
  // The router owns navigation scroll policy. Replay the saved position after
  // remount to exercise the shrink controller's response to restored scroll.
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), pin + 24)
  await expect.poll(() => progress(page)).toBeCloseTo(0.5, 1)

  await page.evaluate(() => {
    document.documentElement.style.fontSize = '18px'
    document.fonts.dispatchEvent(new Event('loadingdone'))
  })
  await expect.poll(() => progressError(page)).toBeLessThan(0.03)
  await page.setViewportSize({ width: 1280, height: 900 })
  await expect.poll(() => board.evaluate(($host) => $host.style.getPropertyValue('--shrink-progress'))).toBe('')
  await page.setViewportSize({ width: 390, height: 844 })
  await expect.poll(() => progressError(page)).toBeLessThan(0.03)
})

function progress(page: Page) {
  return page
    .getByRole('region', { name: 'Deep dive mission board' })
    .evaluate(($host) => Number.parseFloat($host.style.getPropertyValue('--shrink-progress')))
}

function progressError(page: Page) {
  return page.getByRole('region', { name: 'Deep dive mission board' }).evaluate(($host) => {
    const $bar = $host.firstElementChild
    if (!$bar) throw new Error('Missing dive switch')
    const bleed = Math.max(0, -Number.parseFloat(getComputedStyle($bar).marginBlockStart))
    const distance = $host.getBoundingClientRect().top + window.scrollY - bleed
    const expected = Math.min(1, Math.max(0, (window.scrollY - distance) / 48))
    return Math.abs(Number.parseFloat($host.style.getPropertyValue('--shrink-progress')) - expected)
  })
}
