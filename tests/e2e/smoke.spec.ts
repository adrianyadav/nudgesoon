import { expect, test } from '@playwright/test';

test.describe('Public app smoke tests', () => {
  test('renders landing page content', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', { name: 'NudgeSoon', exact: true })
    ).toBeVisible();
    await expect(
      page.getByText('Gentle reminders for everything that expires.')
    ).toBeVisible();
  });

  test('navigates to sign-in from hero CTA', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Get Started Free' }).click();

    await expect(page).toHaveURL(/\/auth\/signin$/);
    await expect(page.getByText('Welcome back')).toBeVisible();
  });

  test('shows client validation for mismatched sign-up passwords', async ({
    page,
  }) => {
    await page.goto('/auth/signin');

    await page
      .getByRole('button', { name: "Don't have an account? Sign up" })
      .click();

    await page.getByLabel('Name').fill('Playwright User');
    await page.getByLabel('Email').fill('playwright@example.com');
    await page.locator('#password').fill('password123');
    await page.locator('#confirmPassword').fill('password456');
    await page.getByRole('button', { name: 'Sign Up' }).click();

    await expect(page.getByText('Passwords do not match')).toBeVisible();
  });
});
