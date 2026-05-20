const { test, expect } = require('@playwright/test');

const TEST_USER = {
  email: 'testuser@stonybrook.edu',
  password: 'TestPassword123!',
};

test.describe('Marketplace (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(TEST_USER.email);
    await page.getByLabel(/password/i).fill(TEST_USER.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('/');
  });

  test('home page shows product grid', async ({ page }) => {
    await expect(page.locator('[data-testid="product-grid"], .MuiGrid-container')).toBeVisible();
  });

  test('search bar filters products', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('textbook');
    await searchInput.press('Enter');
    await expect(page).toHaveURL(/search|query=textbook/i);
  });

  test('clicking a product card navigates to listing detail', async ({ page }) => {
    const firstCard = page.locator('a[href^="/listing/"]').first();
    await firstCard.waitFor();
    const href = await firstCard.getAttribute('href');
    await firstCard.click();
    await expect(page).toHaveURL(href);
  });

  test('sell page loads with form', async ({ page }) => {
    await page.goto('/sell');
    await expect(page.getByLabel(/title|name/i).first()).toBeVisible();
    await expect(page.getByLabel(/price/i)).toBeVisible();
  });
});
