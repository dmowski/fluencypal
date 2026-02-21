import { access, copyFile, mkdir, readdir } from "node:fs/promises";
import { resolve } from "node:path";

import { hasLeadingSilence, trimLeadingSilence } from "../core/ffmpeg.js";
import { ffmpegSilenceCheckConfig } from "../core/ffmpegConfig.js";

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function runProcess(): Promise<void> {
  try {
    const inputDir = resolve(process.cwd(), ffmpegSilenceCheckConfig.inputDirectoryName);
    const outputDir = resolve(process.cwd(), ffmpegSilenceCheckConfig.outputDirectoryName);
    await mkdir(outputDir, { recursive: true });

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

    console.log(`[process] Processing first ${mp3Files.length} audio files...`);

    let skipped = 0;
    let trimmed = 0;
    let copied = 0;

    for (const fileName of mp3Files) {
      const inputPath = resolve(inputDir, fileName);
      const outputPath = resolve(outputDir, fileName);

      if (await exists(outputPath)) {
        skipped += 1;
        console.log(`[process] ${fileName}: already processed, skip`);
        continue;
      }

      const needsTrim = await hasLeadingSilence(inputPath, {
        silenceDurationSec: ffmpegSilenceCheckConfig.silenceDurationSec,
        silenceNoiseThreshold: ffmpegSilenceCheckConfig.silenceNoiseThreshold,
        leadingSilenceEpsilonSec: ffmpegSilenceCheckConfig.leadingSilenceEpsilonSec,
      });

      if (needsTrim) {
        await trimLeadingSilence(inputPath, outputPath, {
          silenceDurationSec: ffmpegSilenceCheckConfig.silenceDurationSec,
          silenceNoiseThreshold: ffmpegSilenceCheckConfig.silenceNoiseThreshold,
        });
        trimmed += 1;
        console.log(`[process] ${fileName}: audio is needed to trime`);
      } else {
        await copyFile(inputPath, outputPath);
        copied += 1;
        console.log(`[process] ${fileName}: Audio is fine`);
      }
    }

    console.log(
      `[process] summary: total=${mp3Files.length}, trimmed=${trimmed}, copied=${copied}, skipped=${skipped}`,
    );

    process.exitCode = 0;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[process] Failed to analyze audio files");
    console.error(`[process] reason: ${message}`);
    process.exitCode = 1;
  }
}
