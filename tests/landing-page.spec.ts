import { expect, test } from '@playwright/test';

test('has landing page titles & buttons', async ({ page }) => {
  await page.goto('http://localhost:3000');
  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/SnapRetro/);

  // Should display landing page titles
  await expect(page.getByText('Create, share, and grow')).toBeVisible();
  await expect(page.getByText('The easiest way to run retrospectives')).toBeVisible();
  await expect(page.getByText('Quick, secure, and no sign-up required.')).toBeVisible();

  // Should display create retro button and Join retro button
  await expect(page.getByRole('link', { name: 'Start a new retrospective' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Join into a retrospective' })).toBeVisible();
});
