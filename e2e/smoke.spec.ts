import { expect, test } from '@playwright/test';

test.describe('smoke', () => {
  test('the home page is rendered on the server', async ({ request }) => {
    const response = await request.get('/');

    expect(response.ok()).toBe(true);
    expect(await response.text()).toContain('Explorar eventos');
  });

  test('the home page loads in the browser without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') {
        errors.push(message.text());
      }
    });

    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1, name: 'Explorar eventos' })).toBeVisible();
    await expect(page).toHaveTitle(/.+/);
    await page.waitForLoadState('networkidle');
    expect(errors).toEqual([]);
  });

  test('the home page fits the viewport without horizontal scroll', async ({ page }) => {
    await page.goto('/');

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('an unknown address shows the not-found page', async ({ page }) => {
    await page.goto('/esta-pagina-no-existe');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Página no encontrada');
  });
});
