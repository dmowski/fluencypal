import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { access, mkdir, readdir, rename, unlink, writeFile } from "node:fs/promises";
import { extname, resolve } from "node:path";

import { getDB } from "../core/firebase.js";

const require = createRequire(import.meta.url);
const ffmpegPath = require("ffmpeg-static") as string | null;

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
const DOWNLOAD_TMP_SUFFIX = ".download";

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

function mapFormatToExtension(formatName: string): string | null {
  if (formatName === "mp4") {
    return "mp4";
  }

  if (formatName === "webm") {
    return "webm";
  }

  if (formatName === "matroska") {
    return "mkv";
  }

  if (formatName === "mov") {
    return "mov";
  }

  if (formatName === "avi") {
    return "avi";
  }

  if (formatName === "mpegts") {
    return "ts";
  }

  if (formatName === "flv") {
    return "flv";
  }

  if (formatName === "3gp") {
    return "3gp";
  }

  return null;
}

async function inspectFfmpegOutput(inputPath: string): Promise<string> {
  if (!ffmpegPath) {
    throw new Error("ffmpeg-static binary is not available");
  }

  return new Promise((resolveOutput, reject) => {
    const child = spawn(ffmpegPath, ["-hide_banner", "-i", inputPath]);
    let output = "";

    child.stdout.on("data", (chunk: Buffer) => {
      output += chunk.toString();
    });

    child.stderr.on("data", (chunk: Buffer) => {
      output += chunk.toString();
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      if (code !== 0 && code !== 1) {
        reject(new Error(`ffmpeg exited with code ${code}`));
        return;
      }

      resolveOutput(output);
    });
  });
}

async function detectVideoExtension(inputPath: string, sourceUrl: string): Promise<string> {
  const output = await inspectFfmpegOutput(inputPath);
  const inputMatch = output.match(/Input #0,\s*(.+?),\s*from\s+/i);

  if (inputMatch?.[1]) {
    const formatParts = inputMatch[1]
      .split(",")
      .map((part) => part.trim().toLowerCase())
      .filter((part) => part.length > 0);

    for (const formatPart of formatParts) {
      const mapped = mapFormatToExtension(formatPart);
      if (mapped) {
        return mapped;
      }
    }
  }

  try {
    const url = new URL(sourceUrl);
    const extFromUrl = extname(url.pathname).replace(".", "").toLowerCase();
    if (extFromUrl) {
      return extFromUrl;
    }
  } catch {
    // noop
  }

  return "mp4";
}

async function findAlreadyDownloadedPath(
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

      const fileHash = hashUrl(sourceUrl);
      const alreadyDownloadedPath = await findAlreadyDownloadedPath(outputDir, fileHash);

      if (alreadyDownloadedPath) {
        skipped += 1;
        console.log(`[stories] skip ${story.id}: already downloaded`);
        continue;
      }

      const tempPath = resolve(outputDir, `${fileHash}${DOWNLOAD_TMP_SUFFIX}`);

      await downloadToFile(sourceUrl, tempPath);

      const extension = await detectVideoExtension(tempPath, sourceUrl);
      const fileName = `${fileHash}.${extension}`;
      const destinationPath = resolve(outputDir, fileName);

      if (await exists(destinationPath)) {
        await unlink(tempPath);
        skipped += 1;
        console.log(`[stories] skip ${story.id}: already downloaded`);
        continue;
      }

      await rename(tempPath, destinationPath);
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
