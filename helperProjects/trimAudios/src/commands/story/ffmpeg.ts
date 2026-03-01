import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { extname } from "node:path";

const require = createRequire(import.meta.url);
const ffmpegPath = require("ffmpeg-static") as string | null;

const WEBM_VIDEO_CRF = "30";
const WEBM_AUDIO_BITRATE = "64k";
const WEBM_DEADLINE = "good";
const WEBM_CPU_USED = "2";

function buildWebmFfmpegArgs(inputPath: string, outputPath: string): string[] {
  return [
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
    "-pix_fmt",
    "yuv420p",
    "-b:v",
    "0",
    "-crf",
    WEBM_VIDEO_CRF,
    "-deadline",
    WEBM_DEADLINE,
    "-cpu-used",
    WEBM_CPU_USED,
    "-row-mt",
    "1",
    "-tile-columns",
    "2",
    "-frame-parallel",
    "1",
    "-auto-alt-ref",
    "1",
    "-lag-in-frames",
    "25",
    "-g",
    "240",
    "-c:a",
    "libopus",
    "-b:a",
    WEBM_AUDIO_BITRATE,
    outputPath,
  ];
}

export function getWebmCommandSignature(): string {
  const signatureSource = [
    "libvpx-vp9",
    "libopus",
    "yuv420p",
    "-b:v 0",
    `-crf ${WEBM_VIDEO_CRF}`,
    `-deadline ${WEBM_DEADLINE}`,
    `-cpu-used ${WEBM_CPU_USED}`,
    "-row-mt 1",
    "-tile-columns 2",
    "-frame-parallel 1",
    "-auto-alt-ref 1",
    "-lag-in-frames 25",
    "-g 240",
    `-b:a ${WEBM_AUDIO_BITRATE}`,
  ].join("|");

  return createHash("sha256").update(signatureSource).digest("hex");
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

  const args = buildWebmFfmpegArgs(inputPath, outputPath);

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
