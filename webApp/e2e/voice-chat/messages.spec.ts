import { expect, test } from './fixtures';
import { resetEmulatorState } from '../libs/books/auth';
import {
  createFounderUser,
  createPaidTestUser,
  signInFounderOnDashboard,
} from '../libs/voice-chat/auth';
import {
  approvePaidUser,
  deleteVoiceChatMessage,
  fetchVoiceChatMessages,
  fetchVoiceChatStatus,
  markVoiceChatListened,
  sendVoiceChatMessage,
} from '../libs/voice-chat/api';

test.describe('Voice Chat messages', () => {
  test.beforeEach(async () => {
    await resetEmulatorState();
  });

  test('approved user sees unread badge and can mark listened', async ({ page }) => {
    const founder = await createFounderUser();
    const speaker = await createPaidTestUser();
    const listener = await createPaidTestUser();
    await approvePaidUser({ approver: founder, applicant: speaker });
    await approvePaidUser({ approver: founder, applicant: listener });

    const { id: messageId } = await sendVoiceChatMessage({ token: speaker.idToken });

    const statusBefore = await fetchVoiceChatStatus(listener.idToken);
    expect(statusBefore.unreadCount).toBeGreaterThan(0);

    await markVoiceChatListened({ token: listener.idToken, messageId });
    const statusAfter = await fetchVoiceChatStatus(listener.idToken);
    expect(statusAfter.unreadCount).toBeLessThan(statusBefore.unreadCount);
  });

  test('listener opens modal and plays a message', async ({ page }) => {
    const founder = await createFounderUser();
    const speaker = await createPaidTestUser();
    const listener = await createPaidTestUser();
    await approvePaidUser({ approver: founder, applicant: speaker });
    await approvePaidUser({ approver: founder, applicant: listener });
    const { id: messageId } = await sendVoiceChatMessage({ token: speaker.idToken });

    const { signInUserOnDashboard } = await import('../libs/voice-chat/auth');
    await signInUserOnDashboard(page, listener);

    await page.goto('/?voiceChat=true');
    const message = page.getByTestId(`voice-chat-message-${messageId}`);
    await expect(message).toBeVisible();
    await expect(message.getByTestId('voice-chat-player')).toBeVisible();
    await message.getByRole('button', { name: 'Play' }).click();
  });

  test('delete removes nested replies', async () => {
    const founder = await createFounderUser();
    const user = await createPaidTestUser();
    await approvePaidUser({ approver: founder, applicant: user });

    const { id: rootId } = await sendVoiceChatMessage({ token: user.idToken });
    const { id: replyId } = await sendVoiceChatMessage({
      token: user.idToken,
      parentMessageId: rootId,
    });

    await deleteVoiceChatMessage({ token: user.idToken, messageId: rootId });
    const { messages } = await fetchVoiceChatMessages(user.idToken);
    expect(messages.some((m) => m.id === rootId || m.id === replyId)).toBe(false);
  });
});
