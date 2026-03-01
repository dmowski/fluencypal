import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

import { getDB } from "../core/firebase.js";
import { STORY_VIDEO_DIR } from "./story/constants.js";
import { backupStoriesSnapshot } from "./story/backup.js";
import { downloadStoryVideo, hashUrl } from "./story/download.js";
import { listOriginVideoFiles, listProcessedOutputFiles } from "./story/files.js";
import { processOriginVideo } from "./story/process.js";
import { Story } from "./story/types.js";
import { uploadProcessedVideo } from "./story/upload.js";

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

    const storyRows = snapshot.docs.map((doc) => {
      const story = doc.data() as Partial<Story>;
      const normalizedStory = {
        id: story.id ?? doc.id,
        ...story,
      } as Story;

      return {
        docId: doc.id,
        story: normalizedStory,
      };
    });

    const stories: Story[] = storyRows.map((row) => row.story);

    const backupPath = await backupStoriesSnapshot(process.cwd(), stories);
    console.log(`[stories] backup created: ${backupPath}`);

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

    const processedOutputs = await listProcessedOutputFiles(outputDir);

    let uploaded = 0;
    let uploadSkipped = 0;
    let uploadFailed = 0;
    const uploadedPublicUrlByHash = new Map<string, string>();

    for (const processedOutput of processedOutputs) {
      const uploadResult = await uploadProcessedVideo(outputDir, processedOutput);

      if (uploadResult.status === "skipped") {
        if (uploadResult.publicUrl) {
          uploadedPublicUrlByHash.set(processedOutput.hash, uploadResult.publicUrl);
        }
        uploadSkipped += 1;
        console.log(`[stories] skip upload ${processedOutput.fileName}: already uploaded`);
        continue;
      }

      if (uploadResult.status === "uploaded") {
        uploadedPublicUrlByHash.set(processedOutput.hash, uploadResult.publicUrl);
        uploaded += 1;
        console.log(
          `[stories] uploaded ${processedOutput.fileName} -> ${uploadResult.destination}`,
        );
        continue;
      }

      uploadFailed += 1;
      console.error(`[stories] failed upload ${processedOutput.fileName}`);
      console.error(`[stories] upload reason: ${uploadResult.reason}`);
    }

    console.log(
      `[stories] upload summary: total=${processedOutputs.length}, uploaded=${uploaded}, skipped=${uploadSkipped}, failed=${uploadFailed}`,
    );

    let dbUpdated = 0;
    let dbSkipped = 0;
    let dbNoUploadedUrl = 0;
    let dbFailed = 0;

    for (const row of storyRows) {
      const sourceUrl = row.story.originalVideoUrl ?? null;

      if (!sourceUrl) {
        dbSkipped += 1;
        continue;
      }

      const fileHash = hashUrl(sourceUrl);
      const uploadedPublicUrl = uploadedPublicUrlByHash.get(fileHash);

      if (!uploadedPublicUrl) {
        dbNoUploadedUrl += 1;
        continue;
      }

      if (row.story.videoUrl === uploadedPublicUrl) {
        dbSkipped += 1;
        continue;
      }

      try {
        await cacheRef.doc(row.docId).update({
          videoUrl: uploadedPublicUrl,
          updatedAtIso: new Date().toISOString(),
        });
        dbUpdated += 1;
        console.log(`[stories] updated story ${row.docId} videoUrl`);
      } catch (updateError: unknown) {
        dbFailed += 1;
        const reason = updateError instanceof Error ? updateError.message : String(updateError);
        console.error(`[stories] failed updating story ${row.docId}`);
        console.error(`[stories] update reason: ${reason}`);
      }
    }

    console.log(
      `[stories] db sync summary: total=${storyRows.length}, updated=${dbUpdated}, skipped=${dbSkipped}, noUploadedUrl=${dbNoUploadedUrl}, failed=${dbFailed}`,
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
