export const ffmpegSilenceCheckConfig = {
  inputDirectoryName: "loadedData",
  maxFilesToCheck: 5,
  silenceDurationSec: 0.05,
  silenceNoiseThreshold: "-35dB",
  leadingSilenceEpsilonSec: 0.001,
} as const;
