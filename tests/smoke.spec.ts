import { expect, test } from '@playwright/test'

test('renders the dashboard without horizontal overflow', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: /Was ist schneller gestiegen/ })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Indexreihen' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Quellen' })).toBeVisible()

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(2)
})
