import { getBucket } from "../core/firebase.js";
import { TTS_AUDIO_PREFIX } from "./config.js";

export async function runRemove(): Promise<void> {
  try {
    const bucket = getBucket();
    const [files] = await bucket.getFiles({ prefix: TTS_AUDIO_PREFIX });

    const onlyObjects = files.filter((file) => file.name !== TTS_AUDIO_PREFIX);

    if (onlyObjects.length === 0) {
      console.log(`[remove] No files found in /${TTS_AUDIO_PREFIX.replace(/\/$/, "")}`);
      process.exitCode = 0;
      return;
    }

    let removed = 0;
    let failed = 0;

    for (const file of onlyObjects.sort((left, right) => left.name.localeCompare(right.name))) {
      try {
        await file.delete();
        removed += 1;
        console.log(`[remove] removed ${file.name}`);
      } catch (error: unknown) {
        failed += 1;
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[remove] Failed to remove file: ${file.name}`);
        console.error(`[remove] reason: ${message}`);
      }
    }

    console.log(`[remove] total: ${onlyObjects.length}, removed: ${removed}, failed: ${failed}`);
    process.exitCode = failed > 0 ? 1 : 0;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[remove] Failed to remove files from Firebase Storage");
    console.error(`[remove] reason: ${message}`);
    process.exitCode = 1;
  }
}
