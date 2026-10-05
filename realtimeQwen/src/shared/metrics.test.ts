import { describe, expect, it } from "vitest";
import { pricingForRegion, parseUsage, estimateCostUsd, costPerHourUsd } from "./pricing";
import { CallMetrics } from "./metrics";
import { formatDuration, formatLatency, formatUsd, normalizeSdp } from "./format";

const pricing = pricingForRegion("singapore");

describe("pricing", () => {
  it("bills audio output and skips output text on audio turns", () => {
    const cost = estimateCostUsd(
      {
        inputTextTokens: 1_000_000,
        inputAudioTokens: 1_000_000,
        outputTextTokens: 1_000_000,
        outputAudioTokens: 1_000_000,
      },
      pricing,
    );
    expect(cost).toBeCloseTo(0.23 + 0.93 + 1.87, 6);
  });

  it("bills output text when the turn has no audio output", () => {
    const cost = estimateCostUsd(
      {
        inputTextTokens: 0,
        inputAudioTokens: 0,
        outputTextTokens: 1_000_000,
        outputAudioTokens: 0,
      },
      pricing,
    );
    expect(cost).toBeCloseTo(0.7, 6);
  });

  it("projects the current spend to an hourly rate", () => {
    expect(costPerHourUsd(0.04, 60_000)).toBeCloseTo(2.4, 6);
    expect(costPerHourUsd(0.04, 500)).toBeNull();
  });

  it("reads Qwen and OpenAI usage field names", () => {
    const qwen = parseUsage({
      input_tokens: 336,
      output_tokens: 41,
      input_tokens_details: { text_tokens: 228, audio_tokens: 108 },
      output_tokens_details: { text_tokens: 9, audio_tokens: 32 },
    });
    expect(qwen).toEqual({
      inputTextTokens: 228,
      inputAudioTokens: 108,
      outputTextTokens: 9,
      outputAudioTokens: 32,
    });

    const openai = parseUsage({
      input_token_details: { text_tokens: 10, audio_tokens: 5 },
      output_token_details: { text_tokens: 2, audio_tokens: 8 },
    });
    expect(openai?.inputAudioTokens).toBe(5);
    expect(openai?.outputAudioTokens).toBe(8);
  });

  it("keeps tokens that the detail fields do not cover", () => {
    const usage = parseUsage({
      input_tokens: 30,
      output_tokens: 10,
      input_tokens_details: { text_tokens: 10, audio_tokens: 10 },
      output_tokens_details: { text_tokens: 4, audio_tokens: 0 },
    });
    expect(usage).toEqual({
      inputTextTokens: 10,
      inputAudioTokens: 20,
      outputTextTokens: 10,
      outputAudioTokens: 0,
    });
  });
});

describe("call metrics", () => {
  it("measures response latency from the local speech end to the first assistant audio", () => {
    const metrics = new CallMetrics();
    metrics.speechStarted(1_000);
    metrics.speechEnded(2_000, "server");
    metrics.speechEnded(1_800, "local");
    metrics.responseCreated(2_100);
    metrics.assistantAudio(2_420);
    metrics.responseDone(3_000, "completed", null, "resp_1");

    const summary = metrics.summarize(10_000, pricing);
    expect(metrics.turns[0]?.responseLatencyMs).toBe(620);
    expect(metrics.turns[0]?.endSource).toBe("local");
    expect(summary.turns).toBe(1);
    expect(summary.averageLatencyMs).toBe(620);
    expect(summary.p95LatencyMs).toBe(620);
    expect(summary.firstResponseLatencyMs).toBe(620);
  });

  it("does not let a later server speech-end overwrite the local end", () => {
    const metrics = new CallMetrics();
    metrics.speechStarted(0);
    metrics.speechEnded(500, "local");
    metrics.speechEnded(1_300, "server");
    metrics.responseCreated(1_400);
    metrics.assistantAudio(1_600);
    expect(metrics.turns[0]?.userSpeechEnd).toBe(500);
    expect(metrics.turns[0]?.responseLatencyMs).toBe(1_100);
  });

  it("keeps a server speech end when the mic stays noisy, and backfills latency", () => {
    const metrics = new CallMetrics();
    metrics.speechStarted(0);
    metrics.speechEnded(400, "server");
    metrics.speechStarted(500);
    metrics.responseCreated(600);
    metrics.assistantAudio(900);
    expect(metrics.turns).toHaveLength(1);
    expect(metrics.turns[0]?.userSpeechEnd).toBe(400);
    expect(metrics.turns[0]?.responseLatencyMs).toBe(500);

    const late = new CallMetrics();
    late.speechStarted(0);
    late.responseCreated(200);
    late.assistantAudio(300);
    late.speechEnded(250, "server");
    expect(late.turns[0]?.responseLatencyMs).toBe(50);
  });

  it("clears a local speech end when the user resumes before a response", () => {
    const metrics = new CallMetrics();
    metrics.speechStarted(0);
    metrics.speechEnded(400, "local");
    metrics.speechStarted(600);
    metrics.speechEnded(900, "local");
    metrics.responseCreated(1_000);
    metrics.assistantAudio(1_200);
    expect(metrics.turns).toHaveLength(1);
    expect(metrics.turns[0]?.userSpeechEnd).toBe(900);
    expect(metrics.turns[0]?.responseLatencyMs).toBe(300);
  });

  it("records interruption latency on the turn that was playing", () => {
    const metrics = new CallMetrics();
    metrics.speechStarted(0);
    metrics.speechEnded(400, "local");
    metrics.responseCreated(500);
    metrics.assistantAudio(700);
    metrics.speechStarted(1_200);
    metrics.playbackMuted(1_280);
    metrics.responseDone(1_300, "cancelled", null, "resp_1");

    expect(metrics.turns[0]?.interrupted).toBe(true);
    expect(metrics.turns[0]?.interruptionLatencyMs).toBe(80);
    expect(metrics.summarize(5_000, pricing).averageInterruptionMs).toBe(80);
    expect(metrics.turns).toHaveLength(2);
  });

  it("sums per-turn usage and ignores a duplicate response id", () => {
    const metrics = new CallMetrics();
    const usage = {
      inputTextTokens: 100,
      inputAudioTokens: 50,
      outputTextTokens: 20,
      outputAudioTokens: 80,
    };
    metrics.speechStarted(0);
    metrics.speechEnded(100, "local");
    metrics.responseCreated(150);
    metrics.assistantAudio(200);
    metrics.responseDone(400, "completed", usage, "resp_1");
    metrics.responseDone(400, "completed", usage, "resp_1");

    metrics.speechStarted(500);
    metrics.speechEnded(700, "local");
    metrics.responseCreated(800);
    metrics.assistantAudio(900);
    metrics.responseDone(1_100, "completed", usage, "resp_2");

    const summary = metrics.summarize(60_000, pricing);
    expect(summary.tokens.inputTextTokens).toBe(200);
    expect(summary.tokens.inputAudioTokens).toBe(100);
    expect(summary.tokens.outputAudioTokens).toBe(160);
    expect(summary.turns).toBe(2);
    expect(summary.totalCostUsd).toBeCloseTo(estimateCostUsd(summary.tokens, pricing), 8);
    expect(summary.p95LatencyMs).toBe(200);
  });

  it("snapshots the experiment checkpoints from the metrics at that minute", () => {
    const metrics = new CallMetrics();
    metrics.speechStarted(0);
    metrics.speechEnded(100, "local");
    metrics.responseCreated(200);
    metrics.assistantAudio(800);
    metrics.responseDone(
      1_000,
      "completed",
      {
        inputTextTokens: 2_000_000,
        inputAudioTokens: 0,
        outputTextTokens: 0,
        outputAudioTokens: 1_000_000,
      },
      "resp_1",
    );

    metrics.noteElapsed(5 * 60_000, pricing);
    metrics.noteElapsed(5 * 60_000 + 10, pricing);
    expect(metrics.checkpoints).toHaveLength(1);
    expect(metrics.checkpoints[0]?.minute).toBe(5);
    expect(metrics.checkpoints[0]?.totalCostUsd).toBeCloseTo(0.46 + 1.87, 6);
    expect(metrics.checkpoints[0]?.costPerMinuteUsd).toBeCloseTo((0.46 + 1.87) / 5, 6);
    expect(metrics.checkpoints[0]?.inputTokensPerMinute).toBeCloseTo(2_000_000 / 5, 6);
    expect(metrics.checkpoints[0]?.outputTokensPerMinute).toBeCloseTo(1_000_000 / 5, 6);

    metrics.noteElapsed(10 * 60_000, pricing);
    expect(metrics.checkpoints.map((item) => item.minute)).toEqual([5, 10]);
  });
});

describe("format", () => {
  it("formats the call clock, money, and latency", () => {
    expect(formatDuration(3 * 60_000 + 42_000)).toBe("03:42");
    expect(formatUsd(0.04)).toBe("$0.0400");
    expect(formatUsd(12)).toBe("$12.00");
    expect(formatLatency(620)).toBe("620 ms");
    expect(formatLatency(1100)).toBe("1.1 s");
    expect(normalizeSdp("v=0\na=1")).toBe("v=0\r\na=1\r\n");
  });
});
