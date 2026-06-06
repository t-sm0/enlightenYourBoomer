import { expect, test } from '@playwright/test'

test('renders the dashboard without horizontal overflow', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('eyb-theme', 'light')
  })
  await page.goto('/')

  await expect(page.getByText('Live-Tracker')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Nein' })).toBeVisible()
  await expect(page.getByText(/Ein Gehalt kauft heute weniger Einstieg/)).toBeVisible()
  await expect(page.getByText('Aufbaukraft seit 2010')).toBeVisible()
  await expect(page.getByRole('heading', { name: /Früher war Sparen hart/ })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Diagramme als Tabs' })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Kaufkraft' })).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('heading', { name: 'Quellen' })).toBeVisible()

  await page.getByRole('button', { name: 'Dark Mode aktivieren' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

  await page.getByRole('button', { name: 'Seit 1970' }).click()
  await expect(page.getByText(/Disclaimer für 1970 bis 2024/)).toBeVisible()
  await page.getByRole('tab', { name: 'Ranking' }).click()
  await expect(page.getByText('Was im gewählten Zeitraum am stärksten gestiegen ist.')).toBeVisible()

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(2)
})
