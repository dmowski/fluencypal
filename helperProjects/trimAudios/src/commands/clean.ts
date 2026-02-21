import { readdir } from "node:fs/promises";
import { resolve } from "node:path";

import { inspectAudioSilence } from "../core/ffmpeg.js";
import { ffmpegSilenceCheckConfig } from "../core/ffmpegConfig.js";
import { getBucket } from "../core/firebase.js";

const DEST_PREFIX = "ttsAudio/";

export async function runClean(): Promise<void> {
  try {
    const inputDir = resolve(process.cwd(), ffmpegSilenceCheckConfig.inputDirectoryName);
    const entries = await readdir(inputDir, { withFileTypes: true });
    const processedDir = resolve(process.cwd(), ffmpegSilenceCheckConfig.outputDirectoryName);
    const bucket = getBucket();

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

        const destination = `${DEST_PREFIX}${fileName}`;

        console.log(`[clean] Empty file: ${destination}`);
        try {
          const result = await bucket.file(destination).delete();
          console.log("Result of deletion", result);
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : String(error);
          console.error(`[clean] Failed to delete file: ${destination}`);
          console.error(`[clean] reason: ${message}`);
        }
      }
    }

    if (onlySilenceFiles.length === 0) {
      //console.log("[clean] No files containing only silence were found.");
      process.exitCode = 0;
      return;
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
