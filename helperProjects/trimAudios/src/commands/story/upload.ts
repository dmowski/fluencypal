import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { getBucket } from "../../core/firebase.js";
import { PROCESSED_LOG_SUFFIX, STORY_UPLOAD_PREFIX } from "./constants.js";
import { ProcessedOutputFile, exists } from "./files.js";

type ProcessedLog = {
  hash?: string;
  sourceFileName?: string;
  outputFileName?: string;
  qualityTargetPercent?: number;
  ffmpegVideoCodec?: string;
  ffmpegCrf?: number;
  ffmpegAudioBitrate?: string;
  ffmpegCommandSignature?: string;
  processedAt?: string;
  uploadDestination?: string;
  publicUrl?: string;
  uploadedAt?: string;
};

export type UploadVideoResult =
  | { status: "uploaded"; destination: string; publicUrl: string }
  | { status: "skipped" }
  | { status: "failed"; reason: string };

async function readLog(logPath: string): Promise<ProcessedLog> {
  if (!(await exists(logPath))) {
    return {};
  }

  try {
    const raw = await readFile(logPath, "utf-8");
    return JSON.parse(raw) as ProcessedLog;
  } catch {
    return {};
  }
}

export async function uploadProcessedVideo(
  outputDir: string,
  processedOutput: ProcessedOutputFile,
): Promise<UploadVideoResult> {
  const logPath = resolve(outputDir, `${processedOutput.hash}${PROCESSED_LOG_SUFFIX}`);

  try {
    const log = await readLog(logPath);

    if (log.publicUrl && log.uploadDestination) {
      return { status: "skipped" };
    }

    const destination = `${STORY_UPLOAD_PREFIX}${processedOutput.fileName}`;

    const bucket = getBucket();
    await bucket.upload(processedOutput.filePath, {
      destination,
      contentType: "video/webm",
    });

    const uploadedFile = bucket.file(destination);
    const publicUrl = uploadedFile.publicUrl();

    const nextLog: ProcessedLog = {
      ...log,
      hash: processedOutput.hash,
      outputFileName: processedOutput.fileName,
      uploadDestination: destination,
      publicUrl,
      uploadedAt: new Date().toISOString(),
    };

    await writeFile(logPath, JSON.stringify(nextLog, null, 2), "utf-8");

    return { status: "uploaded", destination, publicUrl };
  } catch (error: unknown) {
    const reason = error instanceof Error ? error.message : String(error);
    return { status: "failed", reason };
  }
}
