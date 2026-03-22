import { test, expect } from '@playwright/test'
import {
  getOtpFromMailpit,
  clearMailpit,
  cleanupUser,
  findUserByEmail,
  createUser,
} from './helpers'

function testEmail() {
  return `test-${Date.now()}@inbucket.local`
}

test.describe('Signup flow', () => {
  let email: string
  let userId: string | null = null

  test.beforeEach(async () => {
    email = testEmail()
    await clearMailpit()
  })

  test.afterEach(async () => {
    if (!userId) userId = await findUserByEmail(email)
    if (userId) {
      await cleanupUser(userId)
      userId = null
    }
  })

  test('signup → OTP → dashboard', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.locator('h1')).toContainText('Monolith Industries')
    await expect(page.getByText('Create your account')).toBeVisible()

    await page.getByPlaceholder('you@example.com').fill(email)
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page.getByText('Check your email')).toBeVisible()
    await expect(page.getByText(email)).toBeVisible()

    const otp = await getOtpFromMailpit(email)
    await page.getByPlaceholder('Enter code').fill(otp)
    await page.getByRole('button', { name: 'Verify code' }).click()

    await expect(page).toHaveURL('/dashboard', { timeout: 10_000 })
  })

  test('wrong OTP shows error', async ({ page }) => {
    await page.goto('/signup')
    await page.getByPlaceholder('you@example.com').fill(email)
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.getByText('Check your email')).toBeVisible()

    await getOtpFromMailpit(email)

    await page.getByPlaceholder('Enter code').fill('000000')
    await page.getByRole('button', { name: 'Verify code' }).click()

    await expect(page.locator('.text-red-400')).toBeVisible({ timeout: 5_000 })
  })
})

test.describe('Login flow', () => {
  let email: string
  let userId: string

  test.beforeEach(async () => {
    email = testEmail()
    const setup = await createUser(email)
    userId = setup.userId
    await new Promise((r) => setTimeout(r, 500))
    await clearMailpit()
  })

  test.afterEach(async () => {
    await cleanupUser(userId)
  })

  test('login → OTP → dashboard', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Welcome back')).toBeVisible()

    await page.getByPlaceholder('you@example.com').fill(email)
    await page.getByRole('button', { name: 'Send code' }).click()
    await expect(page.getByText('Check your email')).toBeVisible()

    const otp = await getOtpFromMailpit(email)
    await page.getByPlaceholder('Enter code').fill(otp)
    await page.getByRole('button', { name: 'Verify code' }).click()

    await expect(page).toHaveURL('/dashboard', { timeout: 10_000 })
  })
})

test.describe('Resend cooldown', () => {
  let email: string

  test.afterEach(async () => {
    const userId = await findUserByEmail(email)
    if (userId) await cleanupUser(userId)
  })

  test('shows countdown timer after sending OTP', async ({ page }) => {
    email = testEmail()
    await clearMailpit()

    await page.goto('/signup')
    await page.getByPlaceholder('you@example.com').fill(email)
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.getByText('Check your email')).toBeVisible()

    const resendButton = page.getByRole('button', { name: /Resend code/ })
    await expect(resendButton).toBeVisible()
    await expect(resendButton).toBeDisabled()
    await expect(resendButton).toContainText(/\d+s/)
  })
})
