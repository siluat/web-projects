import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

const TIMEOUT = {
  NAVIGATION: 10000,
  ANIMATION: 500,
  SCROLL: 1000,
};

// Test configuration - can be overridden by environment variables
const TEST_CONFIG = {
  NOTE_ID: process.env.TEST_NOTE_ID || '99410091-e57a-49cd-a14a-9d76b4fc572a',
  BASE_URL: process.env.TEST_BASE_URL || '',
};

// Test data for headings - centralized for reusability
const TEST_HEADINGS = {
  OVERVIEW: {
    text: '개요',
    expectedId: '개요',
    expectedFragment: '#개요',
  },
  USAGE_REASON: {
    text: '사용 계기 및 선택 이유',
    expectedId: '사용-계기-및-선택-이유',
    expectedFragment: '#사용-계기-및-선택-이유',
  },
  EXPERIENCE: {
    text: '사용하면서 느낀 점',
    expectedId: '사용하면서-느낀-점',
    expectedFragment: '#사용하면서-느낀-점',
  },
} as const;

// Array of all test headings for iteration
const ALL_TEST_HEADINGS = [
  TEST_HEADINGS.OVERVIEW,
  TEST_HEADINGS.USAGE_REASON,
  TEST_HEADINGS.EXPERIENCE,
] as const;

/**
 * Navigate to a note page with headings for testing
 */
async function navigateToNotePage(page: Page) {
  const noteUrl = `${TEST_CONFIG.BASE_URL}/note/${TEST_CONFIG.NOTE_ID}`;
  await page.goto(noteUrl, {
    waitUntil: 'networkidle',
  });
  await page.waitForFunction(() => document.readyState === 'complete');
}

/**
 * Get heading element by text content
 */
async function getHeadingByText(page: Page, headingText: string) {
  return page.locator('h1, h2, h3, h4, h5, h6').filter({
    hasText: headingText,
  });
}

/**
 * Wait for smooth scroll to complete
 */
async function waitForScrollToComplete(page: Page) {
  await page.waitForTimeout(TIMEOUT.SCROLL);

  // Wait for scroll position to be stable by polling
  let lastScrollY = 0;
  let stableCount = 0;
  const requiredStableChecks = 5;
  const checkInterval = 50;

  while (stableCount < requiredStableChecks) {
    await page.waitForTimeout(checkInterval);

    const currentScrollY = await page.evaluate(() => window.scrollY);

    if (currentScrollY === lastScrollY) {
      stableCount++;
    } else {
      lastScrollY = currentScrollY;
      stableCount = 0;
    }
  }
}

/**
 * Check if URL contains the expected fragment (with URL decoding)
 */
function expectUrlToContainFragment(url: string, expectedFragment: string) {
  const decodedUrl = decodeURIComponent(url);
  expect(decodedUrl).toContain(expectedFragment);
}

test.describe('Heading Autolink and Slug Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToNotePage(page);
  });

  test('headings should have automatically generated id attributes', async ({
    page,
  }) => {
    // Check if headings have id attributes generated by rehype-slug
    for (const { text, expectedId } of ALL_TEST_HEADINGS) {
      const heading = await getHeadingByText(page, text);
      await expect(heading).toBeVisible();
      await expect(heading).toHaveAttribute('id', expectedId);
    }
  });

  test('headings should show link icon on hover', async ({ page }) => {
    const heading = await getHeadingByText(page, TEST_HEADINGS.OVERVIEW.text);
    await expect(heading).toBeVisible();

    // The autolink-heading class is on the <a> tag inside the heading
    const headingLink = heading.locator('a.autolink-heading');
    await expect(headingLink).toBeVisible();
    await expect(headingLink).toHaveClass(/autolink-heading/);

    // Hover over the heading link
    await headingLink.hover();
    await page.waitForTimeout(TIMEOUT.ANIMATION);

    // Check that the heading shows hover styles indicating link functionality
    const computedStyle = await headingLink.evaluate((el) => {
      const style = window.getComputedStyle(el, '::before');
      return {
        content: style.getPropertyValue('content'),
        display: style.getPropertyValue('display'),
      };
    });

    // The CSS should show a "#" before the heading on hover
    expect(computedStyle.content).toContain('#');
    expect(computedStyle.display).toBe('inline-block');
  });

  test('clicking on heading should update URL fragment', async ({ page }) => {
    const heading = await getHeadingByText(page, TEST_HEADINGS.OVERVIEW.text);
    await expect(heading).toBeVisible();

    // Click on the heading link
    const headingLink = heading.locator('a.autolink-heading');
    await expect(headingLink).toBeVisible();
    await headingLink.click();
    await page.waitForTimeout(TIMEOUT.ANIMATION);

    // Check that URL fragment has been updated
    const currentUrl = page.url();
    expectUrlToContainFragment(
      currentUrl,
      TEST_HEADINGS.OVERVIEW.expectedFragment,
    );
  });

  test('clicking on different headings should update URL fragment correctly', async ({
    page,
  }) => {
    // Test with headings that have longer text content
    const headingsToTest = [
      TEST_HEADINGS.USAGE_REASON,
      TEST_HEADINGS.EXPERIENCE,
    ];

    for (const { text, expectedFragment } of headingsToTest) {
      const heading = await getHeadingByText(page, text);
      await expect(heading).toBeVisible();

      const headingLink = heading.locator('a.autolink-heading');
      await expect(headingLink).toBeVisible();
      await headingLink.click();
      await page.waitForTimeout(TIMEOUT.ANIMATION);

      const currentUrl = page.url();
      expectUrlToContainFragment(currentUrl, expectedFragment);
    }
  });

  test('navigating to page with URL fragment should scroll to correct heading', async ({
    page,
  }) => {
    // Navigate directly to a URL with fragment
    const noteUrlWithFragment = `${TEST_CONFIG.BASE_URL}/note/${TEST_CONFIG.NOTE_ID}${TEST_HEADINGS.USAGE_REASON.expectedFragment}`;
    await page.goto(noteUrlWithFragment, {
      waitUntil: 'networkidle',
    });

    await waitForScrollToComplete(page);

    // Check that the page has scrolled to the correct heading
    const targetHeading = await getHeadingByText(
      page,
      TEST_HEADINGS.USAGE_REASON.text,
    );
    await expect(targetHeading).toBeVisible();

    // Verify that the heading is in the viewport
    const isInViewport = await targetHeading.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth
      );
    });

    expect(isInViewport).toBe(true);
  });

  test('headings should have proper accessibility attributes', async ({
    page,
  }) => {
    const heading = await getHeadingByText(page, TEST_HEADINGS.OVERVIEW.text);
    await expect(heading).toBeVisible();

    // The accessibility attributes are on the <a> tag inside the heading
    const headingLink = heading.locator('a.autolink-heading');
    await expect(headingLink).toBeVisible();

    // Check that heading link has proper accessibility attributes
    await expect(headingLink).toHaveAttribute('tabindex', '0');

    // The aria-label should be set by rehype-autolink-headings
    const ariaLabel = await headingLink.getAttribute('aria-label');
    expect(ariaLabel).toBe('Link to this heading');
  });

  test('heading links should be keyboard accessible', async ({ page }) => {
    const heading = await getHeadingByText(page, TEST_HEADINGS.OVERVIEW.text);
    await expect(heading).toBeVisible();

    // Focus on the heading link using keyboard
    const headingLink = heading.locator('a.autolink-heading');
    await expect(headingLink).toBeVisible();
    await headingLink.focus();

    // Press Enter to activate the link
    await page.keyboard.press('Enter');
    await page.waitForTimeout(TIMEOUT.ANIMATION);

    // Check that URL fragment has been updated
    const currentUrl = page.url();
    expectUrlToContainFragment(
      currentUrl,
      TEST_HEADINGS.OVERVIEW.expectedFragment,
    );
  });

  test('multiple headings with same text should have unique IDs', async ({
    page,
  }) => {
    // Get all heading IDs in a single DOM query
    const headingIds = await page.evaluate(() => {
      const headings = document.querySelectorAll(
        'h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]',
      );
      return Array.from(headings)
        .map((heading) => heading.id)
        .filter((id) => id);
    });

    // Check that all IDs are unique using Set
    const uniqueIds = new Set(headingIds);
    expect(uniqueIds.size).toBe(headingIds.length);
  });
});
