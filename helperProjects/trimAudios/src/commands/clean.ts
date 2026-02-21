import { readdir } from "node:fs/promises";
import { resolve } from "node:path";

import { inspectAudioSilence } from "../core/ffmpeg.js";
import { ffmpegSilenceCheckConfig } from "../core/ffmpegConfig.js";

export async function runClean(): Promise<void> {
  try {
    const inputDir = resolve(process.cwd(), ffmpegSilenceCheckConfig.inputDirectoryName);
    const entries = await readdir(inputDir, { withFileTypes: true });

    const mp3Files = entries
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".mp3"))
      .map((entry) => entry.name)
      .sort((left, right) => left.localeCompare(right));

    if (mp3Files.length === 0) {
      console.log(`[clean] No mp3 files found in ${inputDir}`);
      process.exitCode = 0;
      return;
    }

    const onlySilenceFiles: string[] = [];

    for (const fileName of mp3Files) {
      const inputPath = resolve(inputDir, fileName);
      const silenceInfo = await inspectAudioSilence(inputPath, {
        silenceDurationSec: ffmpegSilenceCheckConfig.leadingSilenceDurationSec,
        silenceNoiseThreshold: ffmpegSilenceCheckConfig.silenceNoiseThreshold,
        leadingSilenceEpsilonSec: ffmpegSilenceCheckConfig.leadingSilenceEpsilonSec,
      });

      if (silenceInfo.isOnlySilence) {
        onlySilenceFiles.push(fileName);
        console.log(`[clean] Empty file: ${fileName}`);
      }
    }

    if (onlySilenceFiles.length === 0) {
      console.log("[clean] No files containing only silence were found.");
      process.exitCode = 0;
      return;
    }

    console.log("[clean] Files containing only silence:");
    for (const fileName of onlySilenceFiles) {
      console.log(fileName);
    }

    console.log(`[clean] total only-silence files: ${onlySilenceFiles.length}`);
    process.exitCode = 0;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[clean] Failed to inspect loadedData files");
    console.error(`[clean] reason: ${message}`);
    process.exitCode = 1;
  }
}
