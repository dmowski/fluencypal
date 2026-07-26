import { expect, test } from '@playwright/test';
import { resetEmulatorState, createEmulatorTestUser } from '../libs/books/auth';
import {
  createFounderUser,
  createPaidTestUser,
} from '../libs/voice-chat/auth';
import {
  approvePaidUser,
  decideVoiceChatMembership,
  expectVoiceChatApiError,
  fetchVoiceChatMessages,
  fetchVoiceChatMessagesRaw,
  fetchVoiceChatStatus,
  requestVoiceChatAccess,
} from '../libs/voice-chat/api';

test.describe('Voice Chat access gates', () => {
  test.beforeEach(async () => {
    await resetEmulatorState();
  });

  test('unpaid user cannot list messages', async () => {
    const user = await createEmulatorTestUser();
    const response = await fetchVoiceChatMessagesRaw(user.idToken);
    await expectVoiceChatApiError(response, 403);
  });

  test('paid but unapproved user cannot list messages', async () => {
    const user = await createPaidTestUser();
    await requestVoiceChatAccess(user);

    const response = await fetchVoiceChatMessagesRaw(user.idToken);
    await expectVoiceChatApiError(response, 403);
  });

  test('approved user can list messages after intro is posted', async () => {
    const founder = await createFounderUser();
    const applicant = await createPaidTestUser();
    await approvePaidUser({ approver: founder, applicant });

    const data = await fetchVoiceChatMessages(applicant.idToken);
    expect(data.messages.some((m) => m.isIntro && m.senderId === applicant.uid)).toBe(true);
  });

  test('founder is entitled without payment history', async () => {
    const founder = await createFounderUser();
    const status = await fetchVoiceChatStatus(founder.idToken);
    expect(status.isEntitled).toBe(true);
  });

  test('reject blocks re-request until cooldown', async () => {
    const founder = await createFounderUser();
    const applicant = await createPaidTestUser();
    await requestVoiceChatAccess(applicant);
    await decideVoiceChatMembership({
      approverToken: founder.idToken,
      targetUserId: applicant.uid,
      decision: 'rejected',
    });

    const status = await fetchVoiceChatStatus(applicant.idToken);
    expect(status.member?.status).toBe('rejected');
    expect(status.canRequestAccess).toBe(false);
    expect(status.reRequestAvailableAtIso).toBeTruthy();
  });
});
