import { expect, test } from '@playwright/test'

test('renders the dashboard without horizontal overflow', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('eyb-theme', 'light')
  })
  await page.goto('/')

  await expect(page.getByRole('heading', { name: /Früher sparen. Heute reicht sparen oft nicht mehr/ })).toBeVisible()
  await expect(page.getByText(/Wir konnten früher auch nicht in den Urlaub fahren/)).toBeVisible()
  await expect(page.getByRole('heading', { name: /Was passiert mit dem Gehalt/ })).toBeVisible()
  await expect(page.getByText('Ergebnis lesen')).toBeVisible()
  await expect(page.getByRole('heading', { name: /Produktiver, aber nicht entsprechend kaufkräftiger/ })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Quellen' })).toBeVisible()

  await page.getByRole('button', { name: 'Dark Mode aktivieren' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

  await page.getByRole('button', { name: 'Seit 1970' }).click()
  await expect(page.getByText(/Disclaimer für 1970 bis 2024/)).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Was ist seit 1970 schneller gestiegen?' })).toBeVisible()

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(2)
})
