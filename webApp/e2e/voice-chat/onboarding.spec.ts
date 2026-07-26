import { expect, test } from './fixtures';
import { resetEmulatorState } from '../libs/books/auth';
import {
  createFounderUser,
  createPaidTestUser,
  signInFounderOnDashboard,
} from '../libs/voice-chat/auth';
import {
  approvePaidUser,
  fetchVoiceChatMessages,
  fetchVoiceChatStatus,
  requestVoiceChatAccess,
} from '../libs/voice-chat/api';

test.describe('Voice Chat onboarding', () => {
  test.beforeEach(async () => {
    await resetEmulatorState();
  });

  test('founder approves pending request from dashboard', async ({ page }) => {
    const founder = await createFounderUser();
    const applicant = await createPaidTestUser();
    await requestVoiceChatAccess(applicant);

    await signInFounderOnDashboard(page);
    await expect(page.getByTestId('voice-chat-pending-list')).toBeVisible();
    await expect(page.getByText(applicant.uid)).toBeVisible();

    await page.getByRole('button', { name: 'Approve' }).click();
    await expect(page.getByText(applicant.uid)).toBeHidden();

    const messages = await fetchVoiceChatMessages(applicant.idToken);
    expect(messages.messages.some((m) => m.isIntro && m.senderId === applicant.uid)).toBe(true);

    const applicantStatus = await fetchVoiceChatStatus(applicant.idToken);
    expect(applicantStatus.member?.status).toBe('approved');
  });

  test('request access leaves member pending until approval', async () => {
    const founder = await createFounderUser();
    const applicant = await createPaidTestUser();
    await requestVoiceChatAccess(applicant);

    const status = await fetchVoiceChatStatus(applicant.idToken);
    expect(status.member?.status).toBe('pending');
    expect(status.canRequestAccess).toBe(false);

    const founderStatus = await fetchVoiceChatStatus(founder.idToken);
    expect(founderStatus.pendingMembers.some((m) => m.userId === applicant.uid)).toBe(true);
  });
});
