import { readdir } from "node:fs/promises";
import { resolve } from "node:path";

import { hasLeadingSilence } from "../core/ffmpeg.js";
import { ffmpegSilenceCheckConfig } from "../core/ffmpegConfig.js";

export async function runProcess(): Promise<void> {
  try {
    const inputDir = resolve(process.cwd(), ffmpegSilenceCheckConfig.inputDirectoryName);
    const entries = await readdir(inputDir, { withFileTypes: true });

    const mp3Files = entries
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".mp3"))
      .map((entry) => entry.name)
      .sort((left, right) => left.localeCompare(right))
      .slice(0, ffmpegSilenceCheckConfig.maxFilesToCheck);

    if (mp3Files.length === 0) {
      console.log(`[process] No mp3 files found in ${inputDir}`);
      process.exitCode = 0;
      return;
    }

    console.log(`[process] Checking first ${mp3Files.length} audio files for leading silence (50ms)...`);

    for (const fileName of mp3Files) {
      const inputPath = resolve(inputDir, fileName);
      const needsTrim = await hasLeadingSilence(inputPath, {
        silenceDurationSec: ffmpegSilenceCheckConfig.silenceDurationSec,
        silenceNoiseThreshold: ffmpegSilenceCheckConfig.silenceNoiseThreshold,
        leadingSilenceEpsilonSec: ffmpegSilenceCheckConfig.leadingSilenceEpsilonSec,
      });

      if (needsTrim) {
        console.log(`[process] ${fileName}: audio is needed to trime`);
      } else {
        console.log(`[process] ${fileName}: Audio is fine`);
      }
    }

    process.exitCode = 0;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[process] Failed to analyze audio files");
    console.error(`[process] reason: ${message}`);
    process.exitCode = 1;
  }
}
