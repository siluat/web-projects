import fs from 'node:fs';
import path from 'node:path';
import type { BrowserContext, Locator, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

const ThemeSettingLabel = {
  Dark: '다크',
  Light: '라이트',
  Auto: '자동',
} as const;

const TIMEOUT = {
  NAVIGATION: 10000, // Timeout for page navigation and element waiting
  ANIMATION: 1000, // Wait time for animations to complete
  CLICK_DELAY: 300, // Wait time before and after clicks
  THEME_CHANGE: 500, // Wait time for theme change to apply
};

// Create screenshot directory if it doesn't exist
const screenshotDir = path.join(process.cwd(), 'test-results/screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

/**
 * Initialize stored theme in localStorage
 */
async function initStoredTheme(
  context: BrowserContext,
  storedTheme: 'dark' | 'light' | undefined,
) {
  await context.clearCookies();
  await context.addInitScript((theme) => {
    localStorage.clear();
    sessionStorage.clear();
    if (theme) {
      localStorage.setItem('theme', theme);
    }
  }, storedTheme);
}

/**
 * Open theme options menu and return elements and utility function
 */
async function openThemeOptions(page: Page) {
  await page.waitForLoadState('networkidle');

  // Click the global menu button
  const globalMenuButton = page.getByRole('button', { name: 'Global Menu' });
  await globalMenuButton.waitFor({
    state: 'visible',
    timeout: TIMEOUT.NAVIGATION,
  });

  try {
    await globalMenuButton.click({ force: true, timeout: TIMEOUT.NAVIGATION });
  } catch (error) {
    console.log('First click attempt failed, retrying:', error);
    await page.reload();
    await page.waitForLoadState('networkidle');
    const retryButton = page.getByRole('button', { name: 'Global Menu' });
    await retryButton.waitFor({
      state: 'visible',
      timeout: TIMEOUT.NAVIGATION,
    });
    await retryButton.click({ timeout: TIMEOUT.NAVIGATION });
  }

  // Wait for menu animation to complete
  await page.waitForTimeout(TIMEOUT.ANIMATION);

  // Find menu container and option elements
  const menuContainer = page.locator('[role="menu"]');
  await menuContainer.waitFor({
    state: 'visible',
    timeout: TIMEOUT.NAVIGATION,
  });

  // Define theme option elements
  const themeOptions = {
    autoThemeOption: menuContainer.getByRole('menuitemradio', {
      name: ThemeSettingLabel.Auto,
      exact: true,
    }),
    lightThemeOption: menuContainer.getByRole('menuitemradio', {
      name: ThemeSettingLabel.Light,
      exact: true,
    }),
    darkThemeOption: menuContainer.getByRole('menuitemradio', {
      name: ThemeSettingLabel.Dark,
      exact: true,
    }),
  };

  // Wait for all menu items to load
  await themeOptions.autoThemeOption.waitFor({
    state: 'visible',
    timeout: TIMEOUT.NAVIGATION,
  });

  // Safe click function with retry mechanism
  const safeClick = async (option: Locator) => {
    await option.waitFor({ state: 'visible', timeout: TIMEOUT.NAVIGATION });

    try {
      await option.focus();
      await page.waitForTimeout(TIMEOUT.CLICK_DELAY);
      await option.click({ timeout: TIMEOUT.NAVIGATION, force: true });
    } catch (error) {
      console.log('Click failed, using JavaScript click instead:', error);
      // Try JavaScript click as fallback
      await page.evaluate((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          (elements[0] as HTMLElement).click();
        }
      }, option.toString());
    }
    await page.waitForTimeout(TIMEOUT.CLICK_DELAY);
  };

  return {
    ...themeOptions,
    safeClick,
  };
}

test.describe('Theme Switching in Header', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.clearPermissions();
    await context.clearCookies();
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.readyState === 'complete');
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== 'passed') {
      const screenshotPath = path.join(
        screenshotDir,
        `test-failed-${testInfo.title.replace(/\s+/g, '-')}-${Date.now()}.png`,
      );
      await page.screenshot({ path: screenshotPath });
      console.log(`Test failed: Screenshot saved at ${screenshotPath}`);
    }
  });

  test('Changes to dark theme when dark theme option is clicked', async ({
    page,
    context,
  }) => {
    await initStoredTheme(context, undefined);
    await page.reload({ waitUntil: 'networkidle' });

    const { darkThemeOption, safeClick } = await openThemeOptions(page);
    await safeClick(darkThemeOption);
    await expect(page.locator('html')).toHaveClass('dark');
  });

  test('Changes to light theme when light theme option is clicked', async ({
    page,
    context,
  }) => {
    await initStoredTheme(context, undefined);
    await page.reload({ waitUntil: 'networkidle' });

    const { lightThemeOption, safeClick } = await openThemeOptions(page);
    await safeClick(lightThemeOption);
    await expect(page.locator('html')).not.toHaveClass('dark');
  });

  test('Changes theme according to system preference when auto theme is selected', async ({
    page,
    context,
  }) => {
    await initStoredTheme(context, 'dark');
    await page.reload({ waitUntil: 'networkidle' });

    await expect(page.locator('html')).toHaveClass('dark');
    const { autoThemeOption, safeClick } = await openThemeOptions(page);
    await safeClick(autoThemeOption);
    await page.emulateMedia({ colorScheme: 'light' });

    await page.waitForTimeout(TIMEOUT.THEME_CHANGE);
    await expect(page.locator('html')).not.toHaveClass('dark');
  });
});
