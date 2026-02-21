import { getBucket } from "../core/firebase.js";

const TTS_AUDIO_PREFIX = "ttsAudio/";

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

    console.log(`[load] Files in /${TTS_AUDIO_PREFIX.replace(/\/$/, "")}:`);

    for (const file of onlyObjects.sort((left, right) => left.name.localeCompare(right.name))) {
      console.log(file.name);
    }

    console.log(`[load] Total: ${onlyObjects.length}`);
    process.exitCode = 0;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[load] Failed to list files from Firebase Storage");
    console.error(`[load] reason: ${message}`);
    process.exitCode = 1;
  }
}
