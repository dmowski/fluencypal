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
  /** Fired once per reply when the first TTS audio chunk is about to be sent. */
  onAssistantVoiceStarted?: () => void;
  /** Fired when a TTS stream finishes (passes total MP3 bytes sent). */
  onAssistantVoiceFinished?: (ttsBytes: number) => void;
};

export class TurnPipeline {
  private inFlightAbort: AbortController | null = null;
  private running = false;
  private generateChain: Promise<void> = Promise.resolve();
  /** Bumped on user interrupt — cancels in-flight and queued assistant generations. */
  private generateGeneration = 0;
  private voiceStreamingActive = false;

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

  get isBusy(): boolean {
    return this.running || this.inFlightAbort !== null || this.voiceStreamingActive;
  }

  /** LLM stream in flight (false while waiting for / receiving TTS). */
  get isLlmRunning(): boolean {
    return this.running;
  }

  get isVoiceStreaming(): boolean {
    return this.voiceStreamingActive;
  }

  /** LLM or TTS stream in flight (excludes STT-only work on the pipeline). */
  get isAssistantGenerationActive(): boolean {
    return this.running || this.voiceStreamingActive;
  }

  /** User barge-in: stop LLM/TTS and drop queued assistant replies. */
  abortAssistantOutput(): boolean {
    const wasBusy = this.isAssistantGenerationActive;
    this.generateGeneration += 1;
    this.inFlightAbort?.abort();
    this.inFlightAbort = null;
    this.running = false;
    this.generateChain = Promise.resolve();

    if (this.voiceStreamingActive) {
      this.voiceStreamingActive = false;
      this.callbacks.send({ type: 'assistant.speaking', active: false });
    }

    return wasBusy;
  }

  abortInFlight(): void {
    this.abortAssistantOutput();
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

      if (abort.signal.aborted) {
        return '';
      }

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
    const gen = this.generateGeneration;
    const run = this.runGenerateAssistantResponse(gen).catch((error) => {
      if (isAbortError(error)) {
        return;
      }
      throw error;
    });
    this.generateChain = this.generateChain.then(() => run);
    return this.generateChain;
  }

  private async runGenerateAssistantResponse(gen: number): Promise<void> {
    if (gen !== this.generateGeneration || this.running) {
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

    const isCancelled = (): boolean =>
      gen !== this.generateGeneration || abort.signal.aborted;

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
        if (isCancelled()) {
          return;
        }

        const { done, value } = await llmStream.next();
        if (done) {
          if (value && !isCancelled()) {
            this.callbacks.send(buildUsageMessage({ stage: 'llm', model: models.llm, usage: value }));
          }
          break;
        }

        if (!value.delta || isCancelled()) {
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

      if (isCancelled()) {
        return;
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

      if (!config.voiceEnabled || isCancelled()) {
        return;
      }

      // LLM is done — release `running` so mic tail does not abort TTS before the first audio chunk.
      this.running = false;
      voiceStreamingStarted = true;
      await this.streamAssistantVoice(assistantText, config.voice, abort.signal, gen);
    } catch (error) {
      if (isAbortError(error)) {
        return;
      }
      throw error;
    } finally {
      this.running = false;
      this.releaseNestedAbort(abort);
      if (voiceStreamingStarted && !isCancelled()) {
        this.voiceStreamingActive = false;
        this.callbacks.send({ type: 'assistant.speaking', active: false });
      }
    }
  }

  private async streamAssistantVoice(
    text: string,
    voice: SessionRuntimeConfig['voice'],
    signal: AbortSignal,
    gen: number,
  ): Promise<void> {
    const models = getPipelineModels();
    const ttsStartedAt = Date.now();

    const ttsStream = this.providers.tts.synthesizeStream(text, {
      voice,
      model: models.tts,
      signal,
    });

    let ttsBytes = 0;
    let speakingSignaled = false;

    const signalSpeakingStarted = (): void => {
      if (speakingSignaled || gen !== this.generateGeneration || signal.aborted) {
        return;
      }

      speakingSignaled = true;
      this.voiceStreamingActive = true;
      this.callbacks.onAssistantVoiceStarted?.();
      this.callbacks.send({ type: 'assistant.speaking', active: true });
    };

    try {
      while (true) {
        if (gen !== this.generateGeneration || signal.aborted) {
          return;
        }

        const { done, value } = await ttsStream.next();
        if (done) {
          if (value && gen === this.generateGeneration && !signal.aborted) {
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
        signalSpeakingStarted();
        this.callbacks.sendBinary(value);
      }

      recordPipelineLatency('tts', Date.now() - ttsStartedAt);
    } finally {
      if (gen === this.generateGeneration) {
        if (ttsBytes > 0) {
          this.callbacks.onAssistantVoiceFinished?.(ttsBytes);
        }
        this.voiceStreamingActive = false;
      }
    }
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
