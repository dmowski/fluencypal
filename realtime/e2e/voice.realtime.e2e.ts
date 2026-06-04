import { afterEach, describe, expect, it } from 'vitest';
import { readE2eState } from './globalSetup.js';
import { createEmulatorTestUser, resetEmulatorState } from './helpers/emulatorAuth.js';
import { CASE_2_WAV, USER_RECORDING_WAV, voiceFixturesSkipReason } from './helpers/voiceFixtures.js';
import { RealtimeVoiceWsSession } from './helpers/voiceSession.js';

const wsUrl = () => {
  const baseUrl = readE2eState().realtimeBaseUrl.replace(/^http/, 'ws');
  return `${baseUrl}/v1/session`;
};

const skipReasonApi = voiceFixturesSkipReason();

describe('realtime voice conversation (e2e)', () => {
  afterEach(async () => {
    await resetEmulatorState();
  });

  it.skipIf(Boolean(skipReasonApi))('VC-01 greeting produces assistant transcript and TTS bytes', async () => {
    const user = await createEmulatorTestUser();
    const session = new RealtimeVoiceWsSession(wsUrl(), user.idToken, {});

    await session.connect();
    await session.triggerAssistant();
    await session.waitForGreetingComplete();

    const assistant = session.messages.find(
      (message) => message.type === 'transcript.done' && message.role === 'assistant',
    );
    expect(assistant?.type === 'transcript.done' ? assistant.text.length : 0).toBeGreaterThan(0);
    expect(session.countMessages((message) => message.type === 'usage' && message.stage === 'llm')).toBeGreaterThan(
      0,
    );

    await session.close();
  }, 180_000);

  it.skipIf(Boolean(skipReasonApi))(
    'VC-02 after greeting, streamed hello is transcribed and answered',
    async () => {
      const user = await createEmulatorTestUser();
      const session = new RealtimeVoiceWsSession(wsUrl(), user.idToken, {});

      await session.connect();
      await session.triggerAssistant();
      const messageIndexAfterGreeting = session.messages.length;
      await session.waitForGreetingComplete();

      const interruptsBeforeUser = session.countMessages(
        (message) => message.type === 'assistant.interrupted',
      );

      await session.streamFixture('hello-24k-mono.wav', { pauseAfterMs: 2_500 });

      const userDone = await session.waitForUserTranscript();
      const reply = await session.waitForAssistantTranscript(120_000, {
        afterMessageIndex: messageIndexAfterGreeting,
      });
      expect(reply.type === 'transcript.done' ? reply.text.length : 0).toBeGreaterThan(0);

      expect(userDone.type === 'transcript.done' ? userDone.text.length : 0).toBeGreaterThan(0);
      expect(interruptsBeforeUser).toBe(0);

      await session.close();
    },
    180_000,
  );

  it.skipIf(Boolean(skipReasonApi))('VC-03 user speech without greeting commits STT turn', async () => {
    const user = await createEmulatorTestUser();
    const session = new RealtimeVoiceWsSession(wsUrl(), user.idToken, {});

    await session.connect();
    await session.streamFixture('hello-24k-mono.wav', { pauseAfterMs: 2_500 });

    const userDone = await session.waitForUserTranscript();
    await session.waitForAssistantTranscript();

    expect(userDone.type === 'transcript.done' ? userDone.text.length : 0).toBeGreaterThan(0);
    expect(session.hadAssistantInterrupted()).toBe(false);

    await session.close();
  }, 180_000);

  it.skipIf(Boolean(skipReasonApi))(
    'VC-09 whats-your-name from call start: STT, assistant reply, no interrupt after user turn',
    async () => {
      const user = await createEmulatorTestUser();
      const session = new RealtimeVoiceWsSession(wsUrl(), user.idToken, {
        systemInstruction:
          'You are an English teacher named Alex. Always respond in English. If the user asks your name, say Alex.',
      });

      await session.connect();
      await session.triggerAssistant();

      let stopStreaming = false;
      const streamTask = session.streamFixture(USER_RECORDING_WAV, {
        chunkMs: 100,
        pauseAfterMs: 0,
        repeats: 1,
        shouldStop: () => stopStreaming,
      });

      const userDone = await session.waitForUserTranscript(120_000);
      stopStreaming = true;
      await streamTask;
      const userText = userDone.type === 'transcript.done' ? userDone.text.toLowerCase() : '';
      expect(userText.length).toBeGreaterThan(2);

      const userIndex = session.messages.indexOf(userDone);
      await session.waitForAssistantTranscript(120_000, {
        afterMessageIndex: userIndex,
      });

      const afterUser = session.messagesAfterFirstUserTranscript();
      const interruptsAfterUser = afterUser.filter(
        (message) => message.type === 'assistant.interrupted',
      ).length;
      expect(interruptsAfterUser).toBe(0);
      expect(
        afterUser.some((message) => message.type === 'transcript.done' && message.role === 'assistant'),
      ).toBe(true);

      await session.close();
    },
    240_000,
  );

  it.skipIf(Boolean(voiceFixturesSkipReason({ recording: CASE_2_WAV })))(
    'VC-10 case-2 from call start: assistant reply without interrupt after user turn',
    async () => {
      const user = await createEmulatorTestUser();
      const session = new RealtimeVoiceWsSession(wsUrl(), user.idToken, {
        systemInstruction:
          'You are an English teacher named Alex. Always respond in English. Answer the user clearly.',
      });

      await session.connect();
      await session.triggerAssistant();

      let stopStreaming = false;
      const streamTask = session.streamFixture(CASE_2_WAV, {
        chunkMs: 100,
        pauseAfterMs: 0,
        repeats: 1,
        shouldStop: () => stopStreaming,
      });

      const userDone = await session.waitForUserTranscript(180_000);
      stopStreaming = true;
      await streamTask;

      expect(userDone.type === 'transcript.done' ? userDone.text.length : 0).toBeGreaterThan(2);

      const userIndex = session.messages.indexOf(userDone);
      await session.waitForAssistantTranscript(180_000, {
        afterMessageIndex: userIndex,
      });

      const afterUser = session.messagesAfterFirstUserTranscript();
      expect(afterUser.filter((message) => message.type === 'assistant.interrupted').length).toBe(
        0,
      );

      await session.close();
    },
    300_000,
  );

  it.skipIf(Boolean(skipReasonApi))(
    'VC-04 greeting is not interrupted by silence-only mic input',
    async () => {
      const user = await createEmulatorTestUser();
      const session = new RealtimeVoiceWsSession(wsUrl(), user.idToken, {});

      await session.connect();
      await session.triggerAssistant();

      await Promise.all([
        session.streamFixture('silence-24k-mono.wav', { pauseAfterMs: 400 }),
        session.waitFor(
          (message) => message.type === 'transcript.done' && message.role === 'assistant',
          90_000,
        ),
      ]);

      expect(session.hadAssistantInterrupted()).toBe(false);

      await session.close();
    },
    180_000,
  );
});
