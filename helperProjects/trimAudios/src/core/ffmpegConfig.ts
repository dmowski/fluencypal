export const ffmpegSilenceCheckConfig = {
  inputDirectoryName: "loadedData",
  outputDirectoryName: "processedData",
  leadingSilenceDurationSec: 0.001,
  trailingSilenceKeepSec: 0.1,
  silenceNoiseThreshold: "-35dB",
  leadingSilenceEpsilonSec: 0.001,
} as const;
