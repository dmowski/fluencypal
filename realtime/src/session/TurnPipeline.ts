import { randomUUID } from 'node:crypto';
import { isAbortError } from '../errors/isAbortError.js';
import { estimateAudioDurationMs } from '../protocol/audioCodec.js';
import { buildUsageMessage, getPipelineModels } from '../usage/emitUsage.js';
import { recordPipelineLatency } from '../metrics/sessionMetrics.js';
import type { ProviderRegistry } from '../providers/types.js';
import type { ServerMessage } from '../protocol/messages.js';
import type { ConversationHistory } from './history.js';
import type { SessionRuntimeConfig } from './ConversationSession.js';

export type PipelineCallbacks = {
  send: (message: ServerMessage) => void;
  sendBinary: (chunk: Buffer) => void;
};

export class TurnPipeline {
  private inFlightAbort: AbortController | null = null;
  private running = false;
  private generateChain: Promise<void> = Promise.resolve();

  constructor(
    private readonly providers: ProviderRegistry,
    private readonly callbacks: PipelineCallbacks,
    private readonly getConfig: () => SessionRuntimeConfig,
    private readonly history: ConversationHistory,
    private readonly sessionSignal: AbortSignal,
  ) {}

  get isRunning(): boolean {
    return this.running;
  }

  abortInFlight(): void {
    this.inFlightAbort?.abort();
    this.inFlightAbort = null;
  }

  async transcribeAudio(chunks: Buffer[]): Promise<string> {
    if (chunks.length === 0) {
      return '';
    }

    const pcm = Buffer.concat(chunks);
    const models = getPipelineModels();
    const config = this.getConfig();
    const abort = this.createNestedAbort();

    try {
      const startedAt = Date.now();
      const result = await this.providers.stt.transcribeBatch(pcm, {
        languageCode: config.languageCode,
        model: models.stt,
        signal: abort.signal,
      });
      recordPipelineLatency('stt', Date.now() - startedAt);

      this.callbacks.send(
        buildUsageMessage({
          stage: 'stt',
          model: models.stt,
          usage: result.usage,
          audioDurationSeconds: estimateAudioDurationMs(pcm.length) / 1000,
        }),
      );
      return result.text;
    } catch (error) {
      if (isAbortError(error)) {
        return '';
      }
      throw error;
    } finally {
      this.releaseNestedAbort(abort);
    }
  }

  async generateAssistantResponse(): Promise<void> {
    const run = this.runGenerateAssistantResponse().catch((error) => {
      if (isAbortError(error)) {
        return;
      }
      throw error;
    });
    this.generateChain = this.generateChain.then(() => run);
    return this.generateChain;
  }

  private async runGenerateAssistantResponse(): Promise<void> {
    if (this.running) {
      return;
    }

    this.running = true;
    const abort = this.createNestedAbort();
    const models = getPipelineModels();
    const config = this.getConfig();
    const messageId = randomUUID();
    let assistantText = '';
    let voiceStreamingStarted = false;
    const llmStartedAt = Date.now();

    try {
      const systemMessage = this.buildSystemMessage(config);
      const llmMessages = this.history.list().map((message) => ({
        role: message.role,
        content: message.text,
      }));

      const llmStream = this.providers.llm.streamChat({
        systemMessage,
        messages: llmMessages,
        model: models.llm,
        signal: abort.signal,
      });

      while (true) {
        const { done, value } = await llmStream.next();
        if (done) {
          if (value) {
            this.callbacks.send(buildUsageMessage({ stage: 'llm', model: models.llm, usage: value }));
          }
          break;
        }

        if (!value.delta) {
          continue;
        }

        assistantText += value.delta;
        this.callbacks.send({
          type: 'transcript.delta',
          messageId,
          role: 'assistant',
          delta: value.delta,
        });
      }

      assistantText = assistantText.trim();
      recordPipelineLatency('llm', Date.now() - llmStartedAt);
      if (!assistantText) {
        return;
      }

      this.history.append({
        id: messageId,
        role: 'assistant',
        text: assistantText,
        createdAt: Date.now(),
      });

      this.callbacks.send({
        type: 'transcript.done',
        messageId,
        role: 'assistant',
        text: assistantText,
      });

      if (!config.voiceEnabled) {
        return;
      }

      voiceStreamingStarted = true;
      await this.streamAssistantVoice(assistantText, config.voice, abort.signal);
    } catch (error) {
      if (isAbortError(error)) {
        return;
      }
      throw error;
    } finally {
      this.running = false;
      this.releaseNestedAbort(abort);
      if (voiceStreamingStarted) {
        this.callbacks.send({ type: 'assistant.speaking', active: false });
      }
    }
  }

  private async streamAssistantVoice(
    text: string,
    voice: SessionRuntimeConfig['voice'],
    signal: AbortSignal,
  ): Promise<void> {
    const models = getPipelineModels();
    const ttsStartedAt = Date.now();
    this.callbacks.send({ type: 'assistant.speaking', active: true });

    const ttsStream = this.providers.tts.synthesizeStream(text, {
      voice,
      model: models.tts,
      signal,
    });

    let ttsBytes = 0;

    while (true) {
      const { done, value } = await ttsStream.next();
      if (done) {
        if (value) {
          const audioDurationSeconds = (ttsBytes * 8) / 128_000;
          this.callbacks.send(
            buildUsageMessage({
              stage: 'tts',
              model: models.tts,
              usage: value,
              audioDurationSeconds,
            }),
          );
        }
        break;
      }

      ttsBytes += value.length;
      this.callbacks.sendBinary(value);
    }

    recordPipelineLatency('tts', Date.now() - ttsStartedAt);
  }

  private buildSystemMessage(config: SessionRuntimeConfig): string {
    if (config.correctionInstruction) {
      return config.correctionInstruction;
    }

    return `${config.systemInstruction}\nDo not use emojis in your responses.`.trim();
  }

  private createNestedAbort(): AbortController {
    const controller = new AbortController();
    this.inFlightAbort = controller;

    if (this.sessionSignal.aborted) {
      controller.abort();
    } else {
      this.sessionSignal.addEventListener('abort', () => controller.abort(), { once: true });
    }

    return controller;
  }

  private releaseNestedAbort(controller: AbortController): void {
    if (this.inFlightAbort === controller) {
      this.inFlightAbort = null;
    }
  }
}
