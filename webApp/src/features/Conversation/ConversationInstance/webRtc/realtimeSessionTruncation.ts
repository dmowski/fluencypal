/** OpenAI Realtime: bound post-instruction context; server drops oldest items when over limit. */
export const REALTIME_POST_INSTRUCTIONS_TOKEN_LIMIT = 12_000;

/** Drop a larger chunk when truncating to reduce prompt-cache churn (OpenAI recommendation). */
export const REALTIME_TRUNCATION_RETENTION_RATIO = 0.8;

export const getRealtimeTruncationSessionPatch = () => ({
  truncation: {
    type: 'retention_ratio' as const,
    retention_ratio: REALTIME_TRUNCATION_RETENTION_RATIO,
    token_limits: {
      post_instructions: REALTIME_POST_INSTRUCTIONS_TOKEN_LIMIT,
    },
  },
});
