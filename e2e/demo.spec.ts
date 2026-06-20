import { test, expect } from '@playwright/test'

// These run in demo mode (no Supabase): the app bypasses auth and serves the
// mock dataset, so every assertion is deterministic and needs no credentials.

test('loads the dashboard without a login step', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))

  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Tableau de bord' })).toBeVisible()
  expect(errors, errors.join(' | ')).toEqual([])
})

test('walks the main pages without crashing', async ({ page }) => {
  const routes: Array<[string, string]> = [
    ['/products', 'Produits'],
    ['/looks', 'Looks'],
    ['/users', 'Utilisateurs'],
    ['/products/edit', 'Nouveau produit'],
    ['/looks/edit', 'Créer un look'],
  ]
  for (const [path, heading] of routes) {
    await page.goto(path)
    await expect(page.getByRole('heading', { name: heading })).toBeVisible()
    await expect(page.getByText('Une erreur est survenue')).toHaveCount(0)
  }
})

test('shows mock products and toggles the filters drawer with Escape', async ({ page }) => {
  await page.goto('/products')

  // Mock dataset renders.
  await expect(page.getByText('T-shirt Basic Noir')).toBeVisible()

  // Open the filters drawer.
  await page.getByRole('button', { name: 'Filtres' }).click()
  const drawer = page.getByRole('dialog', { name: 'Filtres produits' })
  await expect(drawer).toBeVisible()

  // Escape closes it (a11y).
  await page.keyboard.press('Escape')
  await expect(drawer).toBeHidden()
})

test('selects a product and reveals the bulk action bar', async ({ page }) => {
  await page.goto('/products')
  await expect(page.getByText('T-shirt Basic Noir')).toBeVisible()

  // Click a card to select it.
  await page.getByText('T-shirt Basic Noir').click()
  await expect(page.getByRole('button', { name: /Supprimer/ })).toBeVisible()
})

test('keyboard shortcuts navigate and open the help dialog', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Tableau de bord' })).toBeVisible()

  // "g" then "p" → Produits
  await page.keyboard.press('g')
  await page.keyboard.press('p')
  await expect(page).toHaveURL(/\/products$/)

  // "?" opens the shortcuts help
  await page.keyboard.press('Shift+Slash')
  await expect(page.getByRole('dialog', { name: 'Raccourcis clavier' })).toBeVisible()
})
