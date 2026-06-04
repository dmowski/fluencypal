export type PipelineStage = "stt" | "llm" | "tts";

type StageMetrics = {
  count: number;
  totalMs: number;
  lastMs: number;
};

const emptyStage = (): StageMetrics => ({
  count: 0,
  totalMs: 0,
  lastMs: 0,
});

const stages: Record<PipelineStage, StageMetrics> = {
  stt: emptyStage(),
  llm: emptyStage(),
  tts: emptyStage(),
};

export const recordPipelineLatency = (stage: PipelineStage, durationMs: number): void => {
  const bucket = stages[stage];
  bucket.count += 1;
  bucket.totalMs += durationMs;
  bucket.lastMs = durationMs;
};

const summarize = (bucket: StageMetrics) => ({
  count: bucket.count,
  lastMs: bucket.lastMs,
  avgMs: bucket.count > 0 ? Math.round(bucket.totalMs / bucket.count) : 0,
});

export const getMetricsSnapshot = (activeSessions: number) => {
  return {
    activeSessions,
    pipeline: {
      stt: summarize(stages.stt),
      llm: summarize(stages.llm),
      tts: summarize(stages.tts),
    },
  };
};

export const resetMetricsForTests = (): void => {
  stages.stt = emptyStage();
  stages.llm = emptyStage();
  stages.tts = emptyStage();
};
