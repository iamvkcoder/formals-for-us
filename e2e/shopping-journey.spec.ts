import { test, expect } from '@playwright/test';

test.describe('FORMALS FOR US End-to-End Customer Journey', () => {
  test('1 to 11: Complete Shopping, Cart, Checkout, and Order History Journey', async ({ page }) => {
    // 1. Open the homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/FORMALS FOR US/);
    await expect(page.getByRole('heading', { name: /Dress With/i })).toBeVisible();
    await expect(page.locator('text=FORMALS FOR US').first()).toBeVisible();

    // 2. Browse the product catalog
    await page.getByRole('link', { name: 'Shop Collection' }).first().click();
    await expect(page).toHaveURL(/\/shop/);
    await expect(page.locator('h1')).toContainText(/All Formalwear/i);

    // 3. Search for a formal shirt
    await page.goto('/shop?search=oxford');
    await expect(page.getByText('Royal Oxford Classic Dress Shirt').first()).toBeVisible();

    // 4. Open product detail page
    await page.getByText('Royal Oxford Classic Dress Shirt').first().click();
    await expect(page).toHaveURL(/\/product\/royal-oxford-classic-dress-shirt/);
    await expect(page.locator('h1')).toContainText('Royal Oxford Classic Dress Shirt');

    // 5. Select tailored size
    await expect(page.getByText('Select Tailored Size:')).toBeVisible();
    const sizeBtn = page.getByRole('button', { name: '40 (M)' }).first();
    await sizeBtn.click();

    // 6. Add product to wardrobe bag
    const addToBagBtn = page.getByRole('button', { name: /Add To Wardrobe Bag/i });
    await expect(addToBagBtn).toBeEnabled();
    await addToBagBtn.click();
    await expect(page.getByText(/Added to your formal wardrobe bag/i)).toBeVisible();

    // 7. Open shopping bag & verify items and totals
    await page.goto('/cart');
    await expect(page.getByText('Royal Oxford Classic Dress Shirt').first()).toBeVisible();
    await expect(page.getByText('Order Breakdown')).toBeVisible();

    // 8. Sign in as test customer before checkout
    await page.goto('/login?redirect=/checkout');
    await page.fill('input[type="email"]', 'arjun.mehta@example.com');
    await page.fill('input[type="password"]', 'Customer@12345');
    await page.click('button:has-text("Sign In")');

    // 9. Now on checkout page
    await page.waitForURL(/\/checkout/);
    await expect(page.getByText('Secure Checkout')).toBeVisible();

    // Select or create address
    const addressSelector = page.locator('input[name="addressSelection"], input[placeholder*="House"]').first();
    await expect(addressSelector).toBeVisible({ timeout: 10000 });

    const hasSavedAddress = await page.locator('input[name="addressSelection"]').first().isVisible();
    if (hasSavedAddress) {
      await page.locator('input[name="addressSelection"]').first().check();
    } else {
      await page.fill('input[placeholder*="House"]', '123 Executive Chambers, KG Marg');
      await page.fill('input[name="city"]', 'New Delhi');
      await page.fill('input[name="state"]', 'Delhi');
      await page.fill('input[name="postalCode"]', '110001');
      await page.click('button:has-text("Save & Use This Address")');
      await expect(page.locator('input[name="addressSelection"]').first()).toBeVisible();
    }

    // Select online simulated payment
    await page.click('input[value="online_simulated"]');

    // 10. Confirm Order
    await page.click('button:has-text("Confirm Order")');

    // 11. Verify Order Confirmation Page
    await expect(page).toHaveURL(/\/order-success\/FFU-2026-/);
    await expect(page.getByText('Thank You For Choosing FORMALS FOR US')).toBeVisible();
    await expect(page.getByText('Order Items & Tailored Specs')).toBeVisible();

    // 12. Open order history
    await page.getByRole('link', { name: 'View In My Orders' }).click();
    await expect(page).toHaveURL(/\/account\/orders/);
    await expect(page.getByRole('heading', { name: 'My Orders' })).toBeVisible();
    await expect(page.locator('text=FFU-2026-').first()).toBeVisible();
  });

  test('12: Test Admin Console and Product Management', async ({ page }) => {
    // Sign in as Admin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@formalsforus.com');
    await page.fill('input[type="password"]', 'Admin@12345');
    await page.click('button:has-text("Sign In")');

    await expect(page.getByText(/Welcome back/i)).toBeVisible();
    await page.waitForURL(/\/account\/profile/);

    // Navigate to Admin Console via profile link
    await page.getByRole('link', { name: /Admin Console/i }).first().click();
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.getByText('Atelier Performance Analytics')).toBeVisible();
    await expect(page.getByText('Total Sales')).toBeVisible();
    await expect(page.getByText('Total Orders')).toBeVisible();

    // Check Admin Products Catalog
    await page.getByRole('link', { name: 'Manage Catalog' }).click();
    await expect(page).toHaveURL(/\/admin\/products/);
    await expect(page.getByText('Formalwear Inventory & Products')).toBeVisible();
    await expect(page.getByText('Royal Oxford Classic Dress Shirt').first()).toBeVisible();
  });

  test('13: Responsive mobile layout verification', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Verify mobile header and logo
    await expect(page.locator('text=FORMALS FOR US').first()).toBeVisible();
    const hamburger = page.locator('button[aria-label="Toggle navigation menu"]');
    await expect(hamburger).toBeVisible();

    // Open mobile drawer
    await hamburger.click();
    await expect(page.locator('p:has-text("Collections")')).toBeVisible();
    await expect(page.locator('.fixed a[href="/category/formal-shirts"]')).toBeVisible();
  });
});
