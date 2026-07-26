import { test as base, expect } from '@playwright/test';
import { mockTelegramHttp } from '../libs/telegram';

export const test = base.extend({
  page: async ({ page }, use) => {
    await mockTelegramHttp(page);
    await use(page);
  },
});

export { expect };
