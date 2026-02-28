import { expect, Page, test } from '@playwright/test';

const DEMO_EMAIL = process.env.E2E_EMAIL ?? 'demo@example.com';
const DEMO_PASSWORD = process.env.E2E_PASSWORD ?? 'demo1234';
const targetBaseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
const isProdTarget = targetBaseURL.includes('nudgesoon.com');
const allowProdMutations = process.env.E2E_ALLOW_PROD_MUTATIONS === 'true';

async function ensureAuthenticated(page: Page) {
  await page.goto('/');

  const addItemHeading = page.getByText('Track something new');
  if (await addItemHeading.isVisible({ timeout: 3000 }).catch(() => false)) {
    return;
  }

  const getStartedButton = page.getByRole('button', { name: 'Get Started Free' });
  if (await getStartedButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await getStartedButton.click();
  } else {
    await page.goto('/auth/signin');
  }

  await page.getByLabel('Email').fill(DEMO_EMAIL);
  await page.locator('#password').fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(addItemHeading).toBeVisible();
}

async function ensureStatusFilterEnabled(page: Page, filterLabel: 'Critical' | 'Approaching' | 'Safe') {
  const button = page.getByRole('button', { name: new RegExp(`^${filterLabel}\\b`) });
  const className = (await button.getAttribute('class')) ?? '';
  if (className.includes('opacity-60')) {
    await button.click();
  }
}

test.describe('Authenticated item workflow', () => {
  test('adds a new expiry item and updates its date', async ({ page }) => {
    test.skip(
      isProdTarget && !allowProdMutations,
      'Mutation flow is skipped on prod by default. Set E2E_ALLOW_PROD_MUTATIONS=true to enable.'
    );

    const uniqueName = `Playwright Item ${Date.now()}`;
    const currentYear = new Date().getFullYear();
    const createdYear = currentYear + 1;
    const updatedYear = currentYear + 2;
    const updatedDate = `${updatedYear}-01-15`;

    await ensureAuthenticated(page);

    await ensureStatusFilterEnabled(page, 'Critical');
    await ensureStatusFilterEnabled(page, 'Approaching');
    await ensureStatusFilterEnabled(page, 'Safe');

    await page.locator('#name').fill(uniqueName);
    await page.locator('#year').fill(String(createdYear));
    await page.getByRole('button', { name: 'Add' }).click();

    const itemCard = page
      .getByTestId('expiry-item-card')
      .filter({ has: page.getByRole('heading', { name: uniqueName, exact: true }) });

    await expect(itemCard).toBeVisible();
    await expect(itemCard.getByText(String(createdYear), { exact: true })).toBeVisible();

    await itemCard.getByRole('button', { name: `Edit expiry date for ${uniqueName}` }).click();
    await itemCard.locator(`input[id^="date-"]`).fill(updatedDate);
    await itemCard.getByRole('button', { name: 'Save date' }).click();

    await expect(itemCard.getByText(String(updatedYear), { exact: true })).toBeVisible();
    await expect(itemCard.getByText('Jan 15')).toBeVisible();
  });
});
