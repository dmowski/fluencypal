import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { extname } from "node:path";

const require = createRequire(import.meta.url);
const ffmpegPath = require("ffmpeg-static") as string | null;

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

export async function detectVideoExtension(inputPath: string, sourceUrl: string): Promise<string> {
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

export async function convertToWebm(inputPath: string, outputPath: string): Promise<void> {
  if (!ffmpegPath) {
    throw new Error("ffmpeg-static binary is not available");
  }

  const args = [
    "-hide_banner",
    "-y",
    "-i",
    inputPath,
    "-map",
    "0:v:0",
    "-map",
    "0:a?",
    "-c:v",
    "libvpx-vp9",
    "-b:v",
    "0",
    "-crf",
    "18",
    "-deadline",
    "good",
    "-cpu-used",
    "2",
    "-row-mt",
    "1",
    "-c:a",
    "libopus",
    "-b:a",
    "96k",
    outputPath,
  ];

  await new Promise<void>((resolveConversion, reject) => {
    const child = spawn(ffmpegPath, args);
    let ffmpegOutput = "";

    child.stdout.on("data", (chunk: Buffer) => {
      ffmpegOutput += chunk.toString();
    });

    child.stderr.on("data", (chunk: Buffer) => {
      ffmpegOutput += chunk.toString();
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`ffmpeg exited with code ${code}\n${ffmpegOutput}`));
        return;
      }

      resolveConversion();
    });
  });
}
