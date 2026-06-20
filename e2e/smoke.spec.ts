import { test, expect } from '@playwright/test'

// Credentials come from the environment so no secret lives in the repo.
const EMAIL = process.env.E2E_EMAIL
const PASSWORD = process.env.E2E_PASSWORD

test('login then walk every page without crashing', async ({ page }) => {
  test.skip(!EMAIL || !PASSWORD, 'Set E2E_EMAIL and E2E_PASSWORD to run this test')

  const pageErrors: string[] = []
  page.on('pageerror', (e) => pageErrors.push(e.message))

  // Unauthenticated → redirected to login.
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Se connecter' })).toBeVisible()

  // Sign in.
  await page.getByLabel('Email').fill(EMAIL!)
  await page.getByLabel('Mot de passe').fill(PASSWORD!)
  await page.getByRole('button', { name: 'Se connecter' }).click()

  // Lands on the dashboard.
  await expect(
    page.getByRole('heading', { name: 'Tableau de bord' })
  ).toBeVisible()

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
    // The ErrorBoundary fallback must never appear.
    await expect(page.getByText('Une erreur est survenue')).toHaveCount(0)
  }

  expect(pageErrors, `page errors: ${pageErrors.join(' | ')}`).toEqual([])
})
