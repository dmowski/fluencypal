import WebSocket from 'ws';
import type { ServerMessage } from '../../src/protocol/messages.js';
import { parseServerMessage } from '../../src/protocol/messages.js';
import { amplifyPcm16Buffer, chunkPcmBuffer, loadWavAsPcm24kMono, trimPcmSilence } from './wav.js';
import type { VoiceFixtureName } from './voiceFixtures.js';
import { isUserRecordingWav, voiceFixturePath } from './voiceFixtures.js';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type VoiceSessionConfig = {
  languageCode?: string;
  mode?: 'PushToTalk' | 'RealTimeConversation';
  voiceEnabled?: boolean;
  micMuted?: boolean;
  systemInstruction?: string;
  voice?: 'shimmer' | 'ash' | 'marin' | 'verse';
};

export class RealtimeVoiceWsSession {
  private socket: WebSocket | null = null;
  readonly messages: ServerMessage[] = [];
  private ttsBytesReceived = 0;

  constructor(
    private readonly wsUrl: string,
    private readonly idToken: string,
    private readonly config: VoiceSessionConfig,
  ) {}

  async connect(): Promise<void> {
    this.socket = new WebSocket(this.wsUrl);

    await new Promise<void>((resolve, reject) => {
      this.socket?.once('open', () => resolve());
      this.socket?.once('error', reject);
    });

    this.socket.on('message', (raw) => {
      const data = Buffer.isBuffer(raw) ? raw : Buffer.from(raw as ArrayBuffer);

      if (data.length === 0) {
        return;
      }

      if (data[0] !== 0x7b) {
        this.ttsBytesReceived += data.length;
        return;
      }

      try {
        const text = data.toString('utf8');
        if (!text.trimStart().startsWith('{')) {
          this.ttsBytesReceived += data.length;
          return;
        }

        this.messages.push(parseServerMessage(JSON.parse(text)));
      } catch {
        this.ttsBytesReceived += data.length;
      }
    });

    this.sendJson({
      type: 'session.start',
      token: this.idToken,
      config: {
        languageCode: 'en',
        mode: 'RealTimeConversation',
        voiceEnabled: true,
        micMuted: false,
        systemInstruction: 'You are an English teacher. Reply briefly in one or two sentences.',
        voice: 'shimmer',
        ...this.config,
      },
    });

    await this.waitFor((message) => message.type === 'session.ready', 30_000);
  }

  sendJson(payload: unknown): void {
    this.socket?.send(JSON.stringify(payload));
  }

  async triggerAssistant(): Promise<void> {
    this.sendJson({ type: 'assistant.trigger' });
  }

  async waitForGreetingComplete(timeoutMs = 90_000): Promise<void> {
    await this.waitFor(
      (message) => message.type === 'transcript.done' && message.role === 'assistant',
      timeoutMs,
    );

    if (this.config.voiceEnabled !== false) {
      await this.waitForTtsBytes(timeoutMs);
    }

    await this.waitFor(
      (message) => message.type === 'assistant.speaking' && message.active === false,
      timeoutMs,
    );

    await this.waitForPlaybackSettle();
  }

  private async waitForTtsBytes(timeoutMs: number): Promise<void> {
    const startedAt = Date.now();

    while (this.ttsBytesReceived === 0) {
      if (Date.now() - startedAt > timeoutMs) {
        throw new Error('Timed out waiting for assistant TTS bytes');
      }

      await sleep(50);
    }
  }

  async waitForPlaybackSettle(extraMs = 600): Promise<void> {
    // Match ConversationSession.onAssistantVoiceFinished (MP3 byte estimate + tail).
    const playbackMs =
      this.ttsBytesReceived > 0
        ? Math.ceil((this.ttsBytesReceived * 8 * 1000) / 128_000) + 350
        : 800;
    await sleep(playbackMs + extraMs);
  }

  async streamFixture(
    name: VoiceFixtureName,
    options: {
      chunkMs?: number;
      pauseAfterMs?: number;
      repeats?: number;
      amplify?: boolean;
      shouldStop?: () => boolean;
    } = {},
  ): Promise<void> {
    let raw = loadWavAsPcm24kMono(voiceFixturePath(name));
    if (isUserRecordingWav(name)) {
      raw = trimPcmSilence(raw);
    }

    const peakTarget =
      options.amplify === false
        ? null
        : typeof options.amplify === 'number'
          ? options.amplify
          : isUserRecordingWav(name)
            ? 10_000
            : 12_000;
    const once = peakTarget === null ? raw : amplifyPcm16Buffer(raw, peakTarget);
    const repeats = options.repeats ?? (name.includes('hello') ? 4 : 1);
    const pcm = repeats > 1 ? Buffer.concat(Array.from({ length: repeats }, () => once)) : once;
    const chunks = chunkPcmBuffer(pcm, options.chunkMs ?? 100);

    for (const chunk of chunks) {
      if (options.shouldStop?.()) {
        break;
      }

      this.sendAudio(chunk);
      await sleep(options.chunkMs ?? 100);
    }

    if (options.pauseAfterMs !== 0) {
      const pauseMs = options.pauseAfterMs ?? 1_500;
      await sleep(pauseMs);
    }
  }

  countAssistantInterrupted(): number {
    return this.countMessages((message) => message.type === 'assistant.interrupted');
  }

  messagesAfterFirstUserTranscript(): ServerMessage[] {
    const userIndex = this.messages.findIndex(
      (message) => message.type === 'transcript.done' && message.role === 'user',
    );

    return userIndex >= 0 ? this.messages.slice(userIndex) : [];
  }

  sendAudio(chunk: Buffer): void {
    this.socket?.send(chunk);
  }

  async waitForUserTranscript(timeoutMs = 90_000): Promise<ServerMessage> {
    await this.waitFor((message) => message.type === 'usage' && message.stage === 'stt', timeoutMs);

    return this.waitFor(
      (message) => message.type === 'transcript.done' && message.role === 'user',
      timeoutMs,
    );
  }

  async waitForAssistantTranscript(
    timeoutMs = 90_000,
    options: { afterMessageIndex?: number } = {},
  ): Promise<ServerMessage> {
    const startIndex = options.afterMessageIndex ?? 0;

    return this.waitFor(
      (message, index) =>
        index >= startIndex &&
        message.type === 'transcript.done' &&
        message.role === 'assistant',
      timeoutMs,
    );
  }

  countMessages(match: (message: ServerMessage) => boolean): number {
    return this.messages.filter(match).length;
  }

  hadAssistantInterrupted(): boolean {
    return this.messages.some((message) => message.type === 'assistant.interrupted');
  }

  async close(): Promise<void> {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.sendJson({ type: 'session.end' });
      await sleep(200);
      this.socket.close();
    }
  }

  async waitFor(
    match: (message: ServerMessage, index: number) => boolean,
    timeoutMs: number,
  ): Promise<ServerMessage> {
    const existingIndex = this.messages.findIndex(match);
    if (existingIndex >= 0) {
      return this.messages[existingIndex]!;
    }

    return new Promise((resolve, reject) => {
      const startedAt = Date.now();
      const interval = setInterval(() => {
        const foundIndex = this.messages.findIndex(match);
        if (foundIndex >= 0) {
          clearInterval(interval);
          resolve(this.messages[foundIndex]!);
          return;
        }

        if (Date.now() - startedAt > timeoutMs) {
          clearInterval(interval);
          reject(
            new Error(
              `Timed out waiting for WS message (last types: ${this.messages
                .slice(-8)
                .map((message) => message.type)
                .join(', ')})`,
            ),
          );
        }
      }, 100);
    });
  }
}
