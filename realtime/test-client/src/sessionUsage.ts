import { calculateStagePriceUsd, formatUsd, type UsageTokens } from './sessionPricing.js';

export type UsageEntry = {
  stage: 'stt' | 'llm' | 'tts' | 'vision';
  model: string;
  usage: UsageTokens;
  priceUsd: number;
  createdAt: number;
};

export class SessionUsageTracker {
  private totalUsd = 0;
  private readonly entries: UsageEntry[] = [];

  record(stage: UsageEntry['stage'], model: string, usage: UsageTokens, createdAt = Date.now()): UsageEntry {
    const priceUsd = calculateStagePriceUsd(stage, model, usage);
    const entry: UsageEntry = { stage, model, usage, priceUsd, createdAt };
    this.entries.unshift(entry);
    this.totalUsd += priceUsd;
    return entry;
  }

  get totalPriceUsd(): number {
    return this.totalUsd;
  }

  get allEntries(): readonly UsageEntry[] {
    return this.entries;
  }

  reset(): void {
    this.totalUsd = 0;
    this.entries.length = 0;
  }

  formatSummaryLine(): string {
    return `Session total: ${formatUsd(this.totalUsd)} (${this.entries.length} usage events)`;
  }

  formatEntryLine(entry: UsageEntry): string {
    const duration =
      entry.usage.audioDurationSeconds !== undefined
        ? ` · ${entry.usage.audioDurationSeconds.toFixed(1)}s audio`
        : '';
    const tokens = `in ${entry.usage.input_tokens} / out ${entry.usage.output_tokens}`;
    return `${formatUsd(entry.priceUsd)} · ${entry.stage.toUpperCase()} · ${entry.model}${duration} · ${tokens}`;
  }
}
