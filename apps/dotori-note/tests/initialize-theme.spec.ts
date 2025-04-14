import { expect, test } from '@playwright/test';

test.describe('Initialize Theme', () => {
  test('should initialize with dark theme when system prefers dark mode', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('should initialize with light theme when system prefers light mode', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('should update to dark theme when system color scheme changes to dark', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveClass(/dark/);

    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('should update to light theme when system color scheme changes to light', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/dark/);

    await page.emulateMedia({ colorScheme: 'light' });
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });
});

test.describe('Theme Setting', () => {
  test('should update to dark theme when theme setting is dark', async ({
    page,
  }) => {
    await page.goto('/');
    const globalMenu = page.getByRole('button', { name: 'Global Menu' });
    await expect(globalMenu).toBeVisible();
  });
});
