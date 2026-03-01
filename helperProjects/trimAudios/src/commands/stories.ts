import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

import { getDB } from "../core/firebase.js";
import { STORY_VIDEO_DIR } from "./story/constants.js";
import { downloadStoryVideo } from "./story/download.js";
import { listOriginVideoFiles } from "./story/files.js";
import { processOriginVideo } from "./story/process.js";
import { Story } from "./story/types.js";

export async function runStories(): Promise<void> {
  try {
    const db = getDB();
    const cacheRef = db.collection("stories");
    const outputDir = resolve(process.cwd(), STORY_VIDEO_DIR);

    await mkdir(outputDir, { recursive: true });

    const snapshot = await cacheRef.get();

    if (snapshot.empty) {
      console.log("[stories] No stories found");
      process.exitCode = 0;
      return;
    }

    const stories: Story[] = snapshot.docs.map((doc) => {
      const story = doc.data() as Partial<Story>;
      return {
        id: story.id ?? doc.id,
        ...story,
      } as Story;
    });

    console.log(`[stories] Found ${stories.length} stories`);

    let downloaded = 0;
    let skipped = 0;
    let withoutVideo = 0;

    for (const story of stories) {
      const sourceUrl = story.originalVideoUrl ?? null;

      if (!sourceUrl) {
        withoutVideo += 1;
        continue;
      }

      const result = await downloadStoryVideo(outputDir, sourceUrl);

      if (result.skipped) {
        skipped += 1;
        console.log(`[stories] skip ${story.id}: already downloaded`);
        continue;
      }

      downloaded += 1;
      console.log(`[stories] downloaded ${story.id} -> ${result.fileName}`);
    }

    console.log(
      `[stories] summary: total=${stories.length}, downloaded=${downloaded}, skipped=${skipped}, withoutVideo=${withoutVideo}`,
    );

    const sourceVideos = await listOriginVideoFiles(outputDir);

    let processed = 0;
    let processSkipped = 0;
    let processFailed = 0;

    for (const sourceVideo of sourceVideos) {
      const processResult = await processOriginVideo(outputDir, sourceVideo);

      if (processResult.status === "skipped") {
        processSkipped += 1;
        console.log(`[stories] skip processing ${sourceVideo.hash}: processed log exists`);
        continue;
      }

      if (processResult.status === "processed") {
        processed += 1;
        console.log(
          `[stories] processed ${sourceVideo.fileName} -> ${processResult.outputFileName}`,
        );
        continue;
      }

      processFailed += 1;
      console.error(`[stories] failed processing ${sourceVideo.fileName}`);
      console.error(`[stories] process reason: ${processResult.reason}`);
    }

    console.log(
      `[stories] processing summary: total=${sourceVideos.length}, processed=${processed}, skipped=${processSkipped}, failed=${processFailed}`,
    );
    console.log(`[stories] outputDir: ${outputDir}`);

    process.exitCode = 0;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[stories] Failed to fetch stories");
    console.error(`[stories] reason: ${message}`);
    process.exitCode = 1;
  }
}
