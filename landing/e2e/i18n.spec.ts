import { test, expect } from '@playwright/test';

test.describe('Internationalization', () => {
  test('should display Russian content with correct locale settings', async ({ page }) => {
    await page.goto('/ru');

    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('ru');

    const contactLinks = page.getByRole('link', { name: 'Контакты' });
    await expect(contactLinks).toHaveCount(1);

    for (const link of await contactLinks.all()) {
      await expect(link).toHaveAttribute('href', '/ru/contacts');
    }

    await expect(page.getByText('Часто задаваемые вопросы')).toBeVisible();

    const descriptionMeta = page.locator('meta[name="description"]');
    await expect(descriptionMeta).toHaveCount(1);

    const content = await descriptionMeta.getAttribute('content');
    expect(content).toBeTruthy();
    expect(content!.length).toBeGreaterThan(0);
    expect(content).toMatch(/FluencyPal/);
  });

  test('should display French content with correct locale settings', async ({ page }) => {
    await page.goto('/fr');

    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('fr');

    await expect(page.getByText('Comment ça marche')).toBeVisible();
  });

  test('should generate correct localized links in language switcher', async ({ page }) => {
    await page.goto('/scenarios/alias-game');

    const chineseLink = page.getByRole('link', { name: 'Switch to Chinese' });

    await expect(chineseLink).toHaveAttribute('href', '/zh/scenarios/alias-game');
  });

  test('should render correct meta tags for default locale', async ({ page }) => {
    await page.goto('/');

    const descriptionMeta = page.locator('meta[name="description"]');
    await expect(descriptionMeta).toHaveCount(1);

    const content = await descriptionMeta.getAttribute('content');
    expect(content).toBeTruthy();
    expect(content!.length).toBeGreaterThan(0);
    expect(content!.startsWith('You already know English.')).toBe(true);

    const contactLinks = page.getByRole('link', { name: 'Contacts' });
    await expect(contactLinks).toHaveCount(1);

    for (const link of await contactLinks.all()) {
      await expect(link).toHaveAttribute('href', '/contacts');
    }
  });
});
