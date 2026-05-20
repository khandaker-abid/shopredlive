const { test, expect } = require('@playwright/test');

const TEST_USER = {
  email: 'testuser@stonybrook.edu',
  password: 'TestPassword123!',
};

test.describe('Wishlist', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(TEST_USER.email);
    await page.getByLabel(/password/i).fill(TEST_USER.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('/');

    const firstCard = page.locator('a[href^="/listing/"]').first();
    await firstCard.waitFor();
    await firstCard.click();
    await page.waitForLoadState('networkidle');
  });

  test('wishlist button is visible on listing detail page', async ({ page }) => {
    const btn = page.getByRole('button', { name: /save to wishlist|remove from wishlist/i });
    await expect(btn).toBeVisible();
  });

  test('toggling wishlist button changes icon state', async ({ page }) => {
    const btn = page.getByRole('button', { name: /save to wishlist/i });
    await btn.click();
    await expect(page.getByRole('button', { name: /remove from wishlist/i })).toBeVisible();
  });

  test('wishlist state persists on page reload', async ({ page }) => {
    const btn = page.getByRole('button', { name: /save to wishlist/i });
    await btn.click();
    await page.reload();
    await expect(page.getByRole('button', { name: /remove from wishlist/i })).toBeVisible();
  });
});
