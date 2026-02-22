import { getBucket } from "../core/firebase.js";
import { access, mkdir } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { LOADED_DATA_DIR, TTS_AUDIO_PREFIX } from "./config.js";

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function runLoad(): Promise<void> {
  try {
    const bucket = getBucket();
    const [files] = await bucket.getFiles({ prefix: TTS_AUDIO_PREFIX });

    const onlyObjects = files.filter((file) => file.name !== TTS_AUDIO_PREFIX);

    if (onlyObjects.length === 0) {
      console.log(`[load] No files found in /${TTS_AUDIO_PREFIX.replace(/\/$/, "")}`);
      process.exitCode = 0;
      return;
    }

    const outputDir = resolve(process.cwd(), LOADED_DATA_DIR);
    await mkdir(outputDir, { recursive: true });

    let downloaded = 0;
    let skipped = 0;

    for (const file of onlyObjects.sort((left, right) => left.name.localeCompare(right.name))) {
      const fileName = basename(file.name);
      const destinationPath = resolve(outputDir, fileName);

      if (await exists(destinationPath)) {
        skipped += 1;
        //console.log(`[load] skip ${file.name}`);
        continue;
      }

      await file.download({ destination: destinationPath });
      downloaded += 1;
      console.log(`[load] loaded ${file.name}`);
    }

    console.log(
      `[load] total: ${onlyObjects.length}, downloaded: ${downloaded}, skipped: ${skipped}`,
    );
    process.exitCode = 0;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[load] Failed to load files from Firebase Storage");
    console.error(`[load] reason: ${message}`);
    process.exitCode = 1;
  }
}
