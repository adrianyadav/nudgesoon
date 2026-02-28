import { test, expect } from '@playwright/test';

test('URL params prepopulate form', async ({ page }) => {
  await page.goto('http://localhost:3000/?name=Gym%20Membership&expiry=2026-03-22');
  
  // Wait for the app to load
  await page.waitForLoadState('networkidle');

  // Check the "What expires?" input
  const nameInput = page.locator('input#name');
  await expect(nameInput).toHaveValue('Gym Membership');

  // Check the year input
  const yearInput = page.locator('input#year');
  await expect(yearInput).toHaveValue('2026');
});
