import { expect, test } from '@playwright/test';

const AUTH_WALL_LAST_METHOD_KEY = 'authWall:lastMethod';

test.describe('AuthWall remembered method', () => {
  test('shows intro stepper when no previous auth method is saved', async ({ page }) => {
    await page.goto('/practice');

    await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in with Google', exact: true })).not.toBeVisible();
  });

  test('skips to auth selection and shows last used auth badge', async ({ page }) => {
    await page.addInitScript(
      ([storageKey, method]) => {
        window.localStorage.setItem(storageKey, method);
      },
      [AUTH_WALL_LAST_METHOD_KEY, 'email'],
    );

    await page.goto('/practice');

    await expect(page.getByRole('button', { name: 'Sign in with Google', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in with email', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next', exact: true })).not.toBeVisible();
    await expect(page.getByTestId('auth-wall-last-method-badge')).toHaveText('Last used: Email');
  });
});