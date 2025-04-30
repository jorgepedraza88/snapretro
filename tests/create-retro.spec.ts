import { expect, test } from '@playwright/test';

test('should create a new retro', async ({ page }) => {
  await page.goto('http://localhost:3000');
  // Click on create retro button
  await page.getByText('Start a new retrospective').click();
  await page.waitForURL('**/create-retro');

  // Expect Create Retro page title
  await expect(page.getByText('Create your Retrospective')).toBeVisible();

  // Fill the form
  await page.getByLabel('Your Name').fill('John Doe');

  // Click add secret word
  await page.getByLabel('Protect with a secret word').click();

  // Fill the secret word
  await page.getByLabel('Choose your secret word').fill('secret');

  // Start the retro
  await page.getByText("Let's begin").click();

  // Expect to be redirected to the retro page
  await page.waitForURL('**/retro/*');

  // Expect to render navigation as admin
  await expect(page.getByRole('button', { name: 'Buy me a coffee!' })).toBeVisible();

  // Expect to render admin actions
  await expect(page.getByText('Columns')).toBeVisible();
  await expect(page.getByText('Secret')).toBeVisible();
  await expect(page.getByText('Settings')).toBeVisible();
  await expect(page.getByText('End')).toBeVisible();
});
