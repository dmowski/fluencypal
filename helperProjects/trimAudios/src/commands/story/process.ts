import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { OUTPUT_WEBM_SUFFIX, PROCESSED_LOG_SUFFIX } from "./constants.js";
import { exists } from "./files.js";
import { convertToWebm, getWebmCommandSignature } from "./ffmpeg.js";
import { OriginVideoFile } from "./types.js";

export type ProcessVideoResult =
  | { status: "processed"; outputFileName: string }
  | { status: "skipped" }
  | { status: "failed"; reason: string };

type ProcessedLog = {
  ffmpegCommandSignature?: string;
};

async function shouldSkipBecauseAlreadyProcessed(
  logPath: string,
  outputPath: string,
): Promise<boolean> {
  if (!(await exists(logPath))) {
    return false;
  }

  if (!(await exists(outputPath))) {
    return false;
  }

  const currentSignature = getWebmCommandSignature();

  try {
    const rawLog = await readFile(logPath, "utf-8");
    const parsedLog = JSON.parse(rawLog) as ProcessedLog;

    return parsedLog.ffmpegCommandSignature === currentSignature;
  } catch {
    return false;
  }
}

export async function processOriginVideo(
  outputDir: string,
  sourceVideo: OriginVideoFile,
): Promise<ProcessVideoResult> {
  const outputFileName = `${sourceVideo.hash}${OUTPUT_WEBM_SUFFIX}`;
  const outputPath = resolve(outputDir, outputFileName);
  const logPath = resolve(outputDir, `${sourceVideo.hash}${PROCESSED_LOG_SUFFIX}`);

  if (await shouldSkipBecauseAlreadyProcessed(logPath, outputPath)) {
    return { status: "skipped" };
  }

  try {
    const ffmpegCommandSignature = getWebmCommandSignature();

    await convertToWebm(sourceVideo.filePath, outputPath);
    await writeFile(
      logPath,
      JSON.stringify(
        {
          hash: sourceVideo.hash,
          sourceFileName: sourceVideo.fileName,
          outputFileName,
          qualityTargetPercent: 90,
          ffmpegVideoCodec: "libvpx-vp9",
          ffmpegCrf: 30,
          ffmpegAudioBitrate: "64k",
          ffmpegCommandSignature,
          processedAt: new Date().toISOString(),
        },
        null,
        2,
      ),
      "utf-8",
    );

    return { status: "processed", outputFileName };
  } catch (error: unknown) {
    const reason = error instanceof Error ? error.message : String(error);
    return { status: "failed", reason };
  }
}
