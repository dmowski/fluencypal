import type { Page } from '@playwright/test';

import {
  type PracticeSignInResult,
  seedPracticeUserSettings,
  signInPracticeWithStepper,
} from '../practice/auth';
import { installExperimentalRealtimeWsMock } from './realtimeWsMock';

export const prepareExperimentalPracticePage = async (
  page: Page,
): Promise<PracticeSignInResult> => {
  await installExperimentalRealtimeWsMock(page);
  await page.context().grantPermissions(['microphone'], { origin: 'http://localhost:3000' });

  const auth = await signInPracticeWithStepper(page);
  await seedPracticeUserSettings(page, { uid: auth.uid, email: auth.email });
  return auth;
};

export const startExperimentalCustomRealtime = async (page: Page): Promise<void> => {
  await page.getByTestId('experimental-custom-realtime-row').click();
};
