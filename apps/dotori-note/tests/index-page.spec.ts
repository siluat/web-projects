import { expect, test } from '@playwright/test';

test('index page has expected title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('도토리 노트');
});
