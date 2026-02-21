export const ffmpegSilenceCheckConfig = {
  inputDirectoryName: "loadedData",
  outputDirectoryName: "processedData",
  maxFilesToCheck: 5,
  leadingSilenceDurationSec: 0.05,
  trailingSilenceKeepSec: 0.1,
  silenceNoiseThreshold: "-35dB",
  leadingSilenceEpsilonSec: 0.001,
} as const;
