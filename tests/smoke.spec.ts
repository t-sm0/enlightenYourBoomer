import { expect, test } from '@playwright/test'

test('renders the dashboard without horizontal overflow', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('eyb-theme', 'light')
  })
  await page.goto('/')

  await expect(page.getByText('Regierungs-Tracker')).toBeVisible()
  await expect(page.getByRole('heading', { name: /Wird Aufbau wieder bezahlbar/ })).toBeVisible()
  await expect(page.getByText(/Die Regierung Merz aus CDU\/CSU und SPD/)).toBeVisible()
  await expect(page.getByText('Reallohn Q1 2026')).toBeVisible()
  await expect(page.getByText('Energieentlastung', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: /Wer verspricht was gegen Kaufkraftverlust/ })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Aktuelle Regierung' })).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('heading', { name: 'Quellen' })).toBeVisible()

  await page.getByRole('button', { name: 'Dark Mode aktivieren' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

  await page.getByRole('tab', { name: 'Die Linke' }).click()
  await expect(page.getByText(/Mietendeckel, mehr öffentlicher Wohnraum/)).toBeVisible()

  await page.getByRole('button', { name: 'Datenarchiv öffnen' }).click()
  await page.getByRole('button', { name: 'Seit 1970' }).click()
  await expect(page.getByText(/Disclaimer für 1970 bis 2024/)).toBeVisible()
  await page.getByRole('tab', { name: 'Ranking' }).click()
  await expect(page.getByText('Was im gewählten Zeitraum am stärksten gestiegen ist.')).toBeVisible()

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(2)
})
