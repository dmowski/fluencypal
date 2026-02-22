import { access, readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { getBucket } from "../core/firebase.js";
import { ffmpegSilenceCheckConfig } from "../core/ffmpegConfig.js";
import { TTS_AUDIO_PREFIX } from "./config.js";

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function runUpload(): Promise<void> {
  try {
    const processedDir = resolve(process.cwd(), ffmpegSilenceCheckConfig.outputDirectoryName);
    const entries = await readdir(processedDir, { withFileTypes: true });

    const filesToUpload = entries
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".mp3"))
      .map((entry) => entry.name)
      .sort((left, right) => left.localeCompare(right));

    if (filesToUpload.length === 0) {
      console.log(`[upload] No processed mp3 files found in ${processedDir}`);
      process.exitCode = 0;
      return;
    }

    const bucket = getBucket();
    let uploaded = 0;
    let skipped = 0;

    for (const fileName of filesToUpload) {
      const localPath = resolve(processedDir, fileName);
      const destination = `${TTS_AUDIO_PREFIX}${fileName}`;
      const logPath = resolve(processedDir, `${fileName}.log`);

      if (await exists(logPath)) {
        skipped += 1;
        //console.log(`[upload] skip ${fileName}: upload log exists`);
        continue;
      }

      await bucket.upload(localPath, {
        destination,
        contentType: "audio/mpeg",
      });

      await writeFile(
        logPath,
        JSON.stringify(
          {
            fileName,
            destination,
            uploadedAt: new Date().toISOString(),
          },
          null,
          2,
        ),
        "utf-8",
      );

      uploaded += 1;

      const progressPercent = ((uploaded / filesToUpload.length) * 100).toFixed(2);
      console.log(`[upload] PROGRESS: ${progressPercent}%`);
    }

    console.log(
      `[upload] summary: selected=${filesToUpload.length}, uploaded=${uploaded}, skipped=${skipped}`,
    );
    process.exitCode = 0;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[upload] Failed to upload processed files");
    console.error(`[upload] reason: ${message}`);
    process.exitCode = 1;
  }
}
