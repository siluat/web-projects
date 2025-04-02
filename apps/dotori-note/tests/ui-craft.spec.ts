import { expect, test } from '@playwright/test';

test('ui-craft page has expected title', async ({ page }) => {
  await page.goto('http://localhost:4321/ui-craft');
  await expect(page).toHaveTitle('UI Craft - 도토리 노트');
});
