import { expect, test } from '@playwright/test';
import { randomUUID } from 'crypto';
import { resetEmulatorState } from '../libs/books/auth';
import { createFounderUser, createPaidTestUser } from '../libs/voice-chat/auth';
import {
  approvePaidUser,
  fetchVoiceChatMessages,
  runVoiceChatCleanup,
  seedExpiredVoiceChatMessage,
  sendVoiceChatMessage,
} from '../libs/voice-chat/api';

test.describe('Voice Chat cleanup cron', () => {
  test.beforeEach(async () => {
    await resetEmulatorState();
  });

  test('removes messages older than TTL and keeps recent ones', async () => {
    const founder = await createFounderUser();
    const user = await createPaidTestUser();
    await approvePaidUser({ approver: founder, applicant: user });

    const expiredId = randomUUID();
    await seedExpiredVoiceChatMessage({ messageId: expiredId, senderId: user.uid });
    const { id: recentId } = await sendVoiceChatMessage({ token: user.idToken });

    const result = await runVoiceChatCleanup();
    expect(result.deletedIds).toContain(expiredId);

    const { messages } = await fetchVoiceChatMessages(user.idToken);
    expect(messages.some((m) => m.id === expiredId)).toBe(false);
    expect(messages.some((m) => m.id === recentId)).toBe(true);
  });
});
