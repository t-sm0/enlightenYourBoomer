import { expect, test } from '@playwright/test'

test('renders the dashboard without horizontal overflow', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: /Mehr Gehalt heißt nicht automatisch mehr Leben/ })).toBeVisible()
  await expect(page.getByRole('heading', { name: /Was passiert mit dem Gehalt/ })).toBeVisible()
  await expect(page.getByRole('heading', { name: /Produktiver, aber nicht entsprechend kaufkräftiger/ })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Quellen' })).toBeVisible()

  await page.getByRole('button', { name: 'Seit 1991' }).click()
  await expect(page.getByRole('heading', { name: 'Was ist seit 1991 schneller gestiegen?' })).toBeVisible()

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(2)
})
