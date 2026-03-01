import { createHash } from "node:crypto";
import { access, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { getDB } from "../core/firebase.js";

export interface Story {
  id: string;
  title: string;
  subtitle: string | null;

  videoUrl: string | null;
  originalVideoUrl?: string | null;

  audioUrl: string | null;
  imageUrl: string;

  storySystemInstruction: string | null;
  textEn: string;
  sunoPrompt: string | null;
  videoDescription: string | null;

  isPublished: boolean;
  createdAtIso: string;
  updatedAtIso: string;
}

const STORY_VIDEO_DIR = "storyVideo";

function hashUrl(url: string): string {
  return createHash("sha256").update(url).digest("hex");
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
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
      const sourceUrl = story.videoUrl ?? story.originalVideoUrl ?? null;

      if (!sourceUrl) {
        withoutVideo += 1;
        continue;
      }

      const fileName = hashUrl(sourceUrl);
      const destinationPath = resolve(outputDir, fileName);

      if (await exists(destinationPath)) {
        skipped += 1;
        console.log(`[stories] skip ${story.id}: already downloaded`);
        continue;
      }

      await downloadToFile(sourceUrl, destinationPath);
      downloaded += 1;
      console.log(`[stories] downloaded ${story.id} -> ${fileName}`);
    }

    console.log(
      `[stories] summary: total=${stories.length}, downloaded=${downloaded}, skipped=${skipped}, withoutVideo=${withoutVideo}`,
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
