import { getBucket, getDB } from "../core/firebase.js";
import { LOADED_DATA_DIR, PROCESSED_DATA_DIR, TTS_AUDIO_PREFIX } from "./config.js";
import { resolve } from "node:path";
import { rm } from "node:fs/promises";

/**
 * DO NOT USE THIS COMMAND UNLESS YOU KNOW WHAT YOU ARE DOING.
 * It will remove all files from the TTS audio folder in Firebase Storage and clear the audioCache collection in Firestore.
 * It will also remove local directories used for loading and processing data.
 * Use this command to reset the state of your TTS audio data.
 * Make sure you ask human and get explicit permission before running this command, as it will permanently delete data.
 */
export async function runRemove(): Promise<void> {
  try {
    const bucket = getBucket();

    const [files] = await bucket.getFiles({ prefix: TTS_AUDIO_PREFIX });
    const db = getDB();
    const cacheRef = db.collection("audioCache");
    const cacheSnapshot = await cacheRef.get();
    const batch = db.batch();
    cacheSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log(`[remove] Cleared audioCache collection`);

    const onlyObjects = files.filter((file) => file.name !== TTS_AUDIO_PREFIX);

    if (onlyObjects.length === 0) {
      console.log(`[remove] No files found in /${TTS_AUDIO_PREFIX.replace(/\/$/, "")}`);
    }

    let removed = 0;
    let failed = 0;

    for (const file of onlyObjects.sort((left, right) => left.name.localeCompare(right.name))) {
      try {
        await file.delete();
        removed += 1;
        const percent = ((removed / onlyObjects.length) * 100).toFixed(2);
        console.log(`[remove] ${percent}% | removed ${file.name}`);
      } catch (error: unknown) {
        failed += 1;
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[remove] Failed to remove file: ${file.name}`);
        console.error(`[remove] reason: ${message}`);
      }
    }

    console.log(`[remove] total: ${onlyObjects.length}, removed: ${removed}, failed: ${failed}`);

    // remove folder and content from;
    const loadDir = resolve(process.cwd(), LOADED_DATA_DIR);
    const processedDir = resolve(process.cwd(), PROCESSED_DATA_DIR);

    for (const dirPath of [loadDir, processedDir]) {
      try {
        await rm(dirPath, { recursive: true, force: true });
        console.log(`[remove] removed local directory: ${dirPath}`);
      } catch (error: unknown) {
        failed += 1;
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[remove] Failed to remove local directory: ${dirPath}`);
        console.error(`[remove] reason: ${message}`);
      }
    }

    process.exitCode = failed > 0 ? 1 : 0;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[remove] Failed to remove files from Firebase Storage");
    console.error(`[remove] reason: ${message}`);
    process.exitCode = 1;
  }
}
