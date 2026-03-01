import { createHash } from "node:crypto";
import { rename, unlink, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { DOWNLOAD_TMP_SUFFIX } from "./constants.js";
import { exists, findAlreadyDownloadedPath } from "./files.js";
import { detectVideoExtension } from "./ffmpeg.js";

function hashUrl(url: string): string {
  return createHash("sha256").update(url).digest("hex");
}

async function downloadToFile(url: string, destinationPath: string): Promise<void> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download video: ${response.status} ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error("Video response body is empty");
  }

  const body = await response.arrayBuffer();
  const buffer = Buffer.from(body);
  await writeFile(destinationPath, buffer);
}

export async function downloadStoryVideo(
  outputDir: string,
  sourceUrl: string,
): Promise<{ fileHash: string; fileName?: string; skipped: boolean }> {
  const fileHash = hashUrl(sourceUrl);
  const alreadyDownloadedPath = await findAlreadyDownloadedPath(outputDir, fileHash);

  if (alreadyDownloadedPath) {
    return { fileHash, skipped: true };
  }

  const tempPath = resolve(outputDir, `${fileHash}${DOWNLOAD_TMP_SUFFIX}`);

  await downloadToFile(sourceUrl, tempPath);

  const extension = await detectVideoExtension(tempPath, sourceUrl);
  const fileName = `${fileHash}.${extension}`;
  const destinationPath = resolve(outputDir, fileName);

  if (await exists(destinationPath)) {
    await unlink(tempPath);
    return { fileHash, skipped: true };
  }

  await rename(tempPath, destinationPath);

  return {
    fileHash,
    fileName,
    skipped: false,
  };
}
