import { access, readdir } from "node:fs/promises";
import { extname, resolve } from "node:path";

import { DOWNLOAD_TMP_SUFFIX, OUTPUT_WEBM_SUFFIX, PROCESSED_LOG_SUFFIX } from "./constants.js";
import { OriginVideoFile } from "./types.js";

export type ProcessedOutputFile = {
  hash: string;
  fileName: string;
  filePath: string;
};

export async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function findAlreadyDownloadedPath(
  outputDir: string,
  fileHash: string,
): Promise<string | null> {
  const entries = await readdir(outputDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }

    if (entry.name === fileHash || entry.name.startsWith(`${fileHash}.`)) {
      return resolve(outputDir, entry.name);
    }
  }

  return null;
}

function extractOriginFileHash(fileName: string): string | null {
  if (
    fileName.endsWith(DOWNLOAD_TMP_SUFFIX) ||
    fileName.endsWith(PROCESSED_LOG_SUFFIX) ||
    fileName.endsWith(OUTPUT_WEBM_SUFFIX)
  ) {
    return null;
  }

  const match = fileName.match(/^([a-f0-9]{64})(?:\.[^.]+)?$/i);
  return match?.[1]?.toLowerCase() ?? null;
}

export async function listOriginVideoFiles(outputDir: string): Promise<OriginVideoFile[]> {
  const entries = await readdir(outputDir, { withFileTypes: true });
  const byHash = new Map<string, OriginVideoFile>();

  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }

    const hash = extractOriginFileHash(entry.name);

    if (!hash) {
      continue;
    }

    const candidate: OriginVideoFile = {
      hash,
      fileName: entry.name,
      filePath: resolve(outputDir, entry.name),
    };

    const existing = byHash.get(hash);
    if (!existing) {
      byHash.set(hash, candidate);
      continue;
    }

    const existingHasExtension = extname(existing.fileName).length > 0;
    const candidateHasExtension = extname(candidate.fileName).length > 0;
    if (!existingHasExtension && candidateHasExtension) {
      byHash.set(hash, candidate);
    }
  }

  return [...byHash.values()].sort((left, right) => left.hash.localeCompare(right.hash));
}

export async function listProcessedOutputFiles(outputDir: string): Promise<ProcessedOutputFile[]> {
  const entries = await readdir(outputDir, { withFileTypes: true });
  const result: ProcessedOutputFile[] = [];

  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }

    if (!entry.name.endsWith(OUTPUT_WEBM_SUFFIX)) {
      continue;
    }

    const hash = entry.name.replace(OUTPUT_WEBM_SUFFIX, "");
    if (!/^[a-f0-9]{64}$/i.test(hash)) {
      continue;
    }

    result.push({
      hash: hash.toLowerCase(),
      fileName: entry.name,
      filePath: resolve(outputDir, entry.name),
    });
  }

  return result.sort((left, right) => left.hash.localeCompare(right.hash));
}
