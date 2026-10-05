import {
  costPerMinuteUsd,
  emptyTokens,
  estimateCostUsd,
  tokensPerMinute,
  type RegionPricing,
  type TokenTotals,
  type UsageSnapshot,
} from "./pricing";

export const EXPERIMENT_MINUTES = [5, 10, 20, 30, 60] as const;

export type ExperimentMinute = (typeof EXPERIMENT_MINUTES)[number];

export type SpeechSource = "local" | "server";

export type TurnRecord = {
  userSpeechStart: number | null;
  userSpeechEnd: number | null;
  endSource: SpeechSource | null;
  assistantResponseStart: number | null;
  firstAssistantAudio: number | null;
  assistantResponseEnd: number | null;
  responseLatencyMs: number | null;
  interrupted: boolean;
  interruptionLatencyMs: number | null;
};

export type Checkpoint = {
  minute: ExperimentMinute;
  turns: number;
  totalCostUsd: number;
  costPerMinuteUsd: number | null;
  averageLatencyMs: number | null;
  inputTokensPerMinute: number | null;
  outputTokensPerMinute: number | null;
};

export type MetricsSummary = {
  turns: number;
  averageLatencyMs: number | null;
  p95LatencyMs: number | null;
  firstResponseLatencyMs: number | null;
  lastLatencyMs: number | null;
  averageInterruptionMs: number | null;
  lastInterruptionMs: number | null;
  interruptionCount: number;
  tokens: TokenTotals;
  totalCostUsd: number;
  costPerMinuteUsd: number | null;
  inputTokensPerMinute: number | null;
  outputTokensPerMinute: number | null;
};

const blankTurn = (): TurnRecord => ({
  userSpeechStart: null,
  userSpeechEnd: null,
  endSource: null,
  assistantResponseStart: null,
  firstAssistantAudio: null,
  assistantResponseEnd: null,
  responseLatencyMs: null,
  interrupted: false,
  interruptionLatencyMs: null,
});

export function percentile(values: number[], p: number): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(p * sorted.length) - 1));
  return sorted[index];
}

export function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export class CallMetrics {
  readonly turns: TurnRecord[] = [];
  readonly checkpoints: Checkpoint[] = [];
  tokens: TokenTotals = emptyTokens();
  private active: TurnRecord | null = null;
  private playing: TurnRecord | null = null;
  private readonly seenResponses = new Set<string>();
  private readonly checkpointMarks = new Set<number>();

  speechStarted(at: number): void {
    if (this.active && this.active.assistantResponseStart == null) {
      if (this.active.userSpeechEnd == null) {
        this.active.userSpeechStart = Math.min(this.active.userSpeechStart ?? at, at);
        return;
      }
      if (this.active.endSource === "server") return;
      this.active.userSpeechEnd = null;
      this.active.endSource = null;
      this.active.userSpeechStart = Math.min(this.active.userSpeechStart ?? at, at);
      return;
    }

    const turn = blankTurn();
    turn.userSpeechStart = at;
    this.turns.push(turn);
    this.active = turn;
  }

  speechEnded(at: number, source: SpeechSource): void {
    const turn = this.active ?? (this.playing?.userSpeechEnd == null ? this.playing : null);
    if (!turn || turn.assistantResponseEnd != null) return;
    if (source === "local") {
      turn.userSpeechEnd = at;
      turn.endSource = "local";
    } else if (turn.endSource !== "local") {
      turn.userSpeechEnd = at;
      turn.endSource = "server";
    }
    this.assignLatency(turn);
  }

  responseCreated(at: number): void {
    const turn = this.latestWaiting() ?? this.active;
    if (!turn) return;
    turn.assistantResponseStart = at;
    this.playing = turn;
    if (this.active === turn) this.active = null;
  }

  assistantAudio(at: number): void {
    const turn = this.playing;
    if (!turn || turn.firstAssistantAudio != null) return;
    turn.firstAssistantAudio = at;
    this.assignLatency(turn);
  }

  responseDone(at: number, status: string, usage: UsageSnapshot | null, responseId: string | null): void {
    if (responseId && this.seenResponses.has(responseId)) return;
    if (responseId) this.seenResponses.add(responseId);

    const turn = this.playing;
    if (turn && turn.assistantResponseEnd == null) {
      turn.assistantResponseEnd = at;
      if (status === "cancelled") turn.interrupted = true;
    }
    if (usage) this.addUsage(usage);
    if (this.playing === turn) this.playing = null;
  }

  playbackMuted(at: number): void {
    const playing = this.playing;
    if (!playing) return;
    playing.interrupted = true;
    if (playing.interruptionLatencyMs != null) return;
    const interruptStart = this.active?.userSpeechStart;
    if (interruptStart == null || interruptStart >= at) return;
    playing.interruptionLatencyMs = at - interruptStart;
  }

  noteElapsed(elapsedMs: number, pricing: RegionPricing): void {
    for (const minute of EXPERIMENT_MINUTES) {
      if (this.checkpointMarks.has(minute)) continue;
      if (elapsedMs < minute * 60_000) continue;
      this.checkpointMarks.add(minute);
      const durationMs = minute * 60_000;
      const summary = this.summarize(durationMs, pricing);
      this.checkpoints.push({
        minute,
        turns: summary.turns,
        totalCostUsd: summary.totalCostUsd,
        costPerMinuteUsd: summary.costPerMinuteUsd,
        averageLatencyMs: summary.averageLatencyMs,
        inputTokensPerMinute: summary.inputTokensPerMinute,
        outputTokensPerMinute: summary.outputTokensPerMinute,
      });
    }
  }

  summarize(elapsedMs: number, pricing: RegionPricing): MetricsSummary {
    const completed = this.turns.filter((turn) => turn.assistantResponseEnd != null);
    const latencies = this.turns
      .map((turn) => turn.responseLatencyMs)
      .filter((value): value is number => value != null);
    const interruptions = this.turns
      .map((turn) => turn.interruptionLatencyMs)
      .filter((value): value is number => value != null);
    const totalCostUsd = estimateCostUsd(this.tokens, pricing);
    const inputTokens = this.tokens.inputTextTokens + this.tokens.inputAudioTokens;
    const outputTokens = this.tokens.outputTextTokens + this.tokens.outputAudioTokens;

    return {
      turns: completed.length,
      averageLatencyMs: average(latencies),
      p95LatencyMs: percentile(latencies, 0.95),
      firstResponseLatencyMs: latencies[0] ?? null,
      lastLatencyMs: latencies.at(-1) ?? null,
      averageInterruptionMs: average(interruptions),
      lastInterruptionMs: interruptions.at(-1) ?? null,
      interruptionCount: interruptions.length,
      tokens: { ...this.tokens },
      totalCostUsd,
      costPerMinuteUsd: costPerMinuteUsd(totalCostUsd, elapsedMs),
      inputTokensPerMinute: tokensPerMinute(inputTokens, elapsedMs),
      outputTokensPerMinute: tokensPerMinute(outputTokens, elapsedMs),
    };
  }

  private assignLatency(turn: TurnRecord): void {
    if (turn.responseLatencyMs != null || turn.userSpeechEnd == null || turn.firstAssistantAudio == null) return;
    turn.responseLatencyMs = Math.max(0, turn.firstAssistantAudio - turn.userSpeechEnd);
  }

  private latestWaiting(): TurnRecord | null {
    for (let index = this.turns.length - 1; index >= 0; index -= 1) {
      const turn = this.turns[index];
      if (turn && turn.assistantResponseStart == null && turn.userSpeechEnd != null) return turn;
    }
    return null;
  }

  private addUsage(usage: UsageSnapshot): void {
    this.tokens.inputTextTokens += usage.inputTextTokens;
    this.tokens.inputAudioTokens += usage.inputAudioTokens;
    this.tokens.outputTextTokens += usage.outputTextTokens;
    this.tokens.outputAudioTokens += usage.outputAudioTokens;
  }
}
