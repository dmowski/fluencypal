import { readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
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
  | { status: "skipped"; publicUrl?: string }
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

function buildFirebasePublicUrl(bucketName: string, destination: string, token: string): string {
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(destination)}?alt=media&token=${token}`;
}

async function ensureFirebasePublicUrl(destination: string): Promise<string> {
  const bucket = getBucket();
  const file = bucket.file(destination);
  const [metadata] = await file.getMetadata();

  const rawTokens = metadata.metadata?.firebaseStorageDownloadTokens;
  const normalizedTokens = typeof rawTokens === "string" ? rawTokens : undefined;
  const firstToken = normalizedTokens
    ?.split(",")
    .map((item: string) => item.trim())
    .find((item: string) => item.length > 0);

  if (firstToken) {
    return buildFirebasePublicUrl(bucket.name, destination, firstToken);
  }

  const nextToken = randomUUID();

  await file.setMetadata({
    metadata: {
      ...(metadata.metadata ?? {}),
      firebaseStorageDownloadTokens: nextToken,
    },
  });

  return buildFirebasePublicUrl(bucket.name, destination, nextToken);
}

export async function uploadProcessedVideo(
  outputDir: string,
  processedOutput: ProcessedOutputFile,
): Promise<UploadVideoResult> {
  const logPath = resolve(outputDir, `${processedOutput.hash}${PROCESSED_LOG_SUFFIX}`);

  try {
    const log = await readLog(logPath);
    const defaultDestination = `${STORY_UPLOAD_PREFIX}${processedOutput.fileName}`;

    if (log.uploadDestination && !log.publicUrl) {
      const publicUrl = await ensureFirebasePublicUrl(log.uploadDestination);
      const nextLog: ProcessedLog = {
        ...log,
        hash: processedOutput.hash,
        outputFileName: processedOutput.fileName,
        publicUrl,
      };

      await writeFile(logPath, JSON.stringify(nextLog, null, 2), "utf-8");
      return { status: "skipped", publicUrl };
    }

    if (log.publicUrl && log.uploadDestination) {
      const publicUrl = await ensureFirebasePublicUrl(log.uploadDestination);

      if (publicUrl !== log.publicUrl) {
        const nextLog: ProcessedLog = {
          ...log,
          hash: processedOutput.hash,
          outputFileName: processedOutput.fileName,
          publicUrl,
        };

        await writeFile(logPath, JSON.stringify(nextLog, null, 2), "utf-8");
      }

      return { status: "skipped", publicUrl };
    }

    if (!log.uploadDestination && log.publicUrl) {
      const publicUrl = await ensureFirebasePublicUrl(defaultDestination);
      const nextLog: ProcessedLog = {
        ...log,
        hash: processedOutput.hash,
        outputFileName: processedOutput.fileName,
        uploadDestination: defaultDestination,
        publicUrl,
      };

      await writeFile(logPath, JSON.stringify(nextLog, null, 2), "utf-8");
      return { status: "skipped", publicUrl };
    }

    const destination = defaultDestination;

    const bucket = getBucket();
    await bucket.upload(processedOutput.filePath, {
      destination,
      contentType: "video/webm",
    });

    const publicUrl = await ensureFirebasePublicUrl(destination);

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
