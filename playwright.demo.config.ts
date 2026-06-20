import { defineConfig } from '@playwright/test'

// E2E against the app in DEMO mode: Supabase env is blanked out, so auth is
// bypassed and the UI runs on the localStorage-backed mock data. Deterministic
// and secret-free — runs anywhere. (The default playwright.config.ts covers the
// authenticated smoke test against a real Supabase project.)
const PORT = 5180
const baseURL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  testMatch: /demo\.spec\.ts/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL,
    // Bundled Chromium (no Chrome channel dependency).
    trace: 'on-first-retry',
  },
  webServer: {
    command: `bun run dev --port ${PORT} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      VITE_SUPABASE_URL: '',
      VITE_SUPABASE_PUBLISHABLE_KEY: '',
    },
  },
})
