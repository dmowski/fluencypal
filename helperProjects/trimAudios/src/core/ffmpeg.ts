import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ffmpegPath = require("ffmpeg-static") as string | null;

export async function hasLeadingSilence(
  inputPath: string,
  options: {
    silenceDurationSec: number;
    silenceNoiseThreshold: string;
    leadingSilenceEpsilonSec: number;
  },
): Promise<boolean> {
  if (!ffmpegPath) {
    throw new Error("ffmpeg-static binary is not available");
  }

  const args = [
    "-hide_banner",
    "-nostats",
    "-i",
    inputPath,
    "-af",
    `silencedetect=noise=${options.silenceNoiseThreshold}:d=${options.silenceDurationSec}`,
    "-f",
    "null",
    "-",
  ];

  const output = await runFfmpeg(ffmpegPath, args);
  const silenceStartValues = extractSilenceStartValues(output);

  return silenceStartValues.some((value) => value <= options.leadingSilenceEpsilonSec);
}

function runFfmpeg(command: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args);

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
      if (code !== 0) {
        reject(new Error(`ffmpeg exited with code ${code}\n${output}`));
        return;
      }

      resolve(output);
    });
  });
}

function extractSilenceStartValues(logOutput: string): number[] {
  const values: number[] = [];
  const regex = /silence_start:\s*([0-9]*\.?[0-9]+)/g;

  for (const match of logOutput.matchAll(regex)) {
    const parsed = Number(match[1]);

    if (!Number.isNaN(parsed)) {
      values.push(parsed);
    }
  }

  return values;
}
