import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ffmpegPath = require("ffmpeg-static") as string | null;

type SilenceInspectOptions = {
  silenceDurationSec: number;
  silenceNoiseThreshold: string;
  leadingSilenceEpsilonSec: number;
};

export type SilenceInspectResult = {
  hasLeadingSilence: boolean;
  isOnlySilence: boolean;
};

export async function inspectAudioSilence(
  inputPath: string,
  options: SilenceInspectOptions,
): Promise<SilenceInspectResult> {
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
  const silenceDurationValues = extractSilenceDurationValues(output);
  const audioDurationSec = extractAudioDurationSec(output);

  const hasLeadingSilence = silenceStartValues.some(
    (value) => value <= options.leadingSilenceEpsilonSec,
  );

  let isOnlySilence = false;
  if (hasLeadingSilence && audioDurationSec !== null && silenceDurationValues.length > 0) {
    const maxSilenceDuration = Math.max(...silenceDurationValues);
    const tolerance = Math.max(0.02, audioDurationSec * 0.01);
    isOnlySilence = maxSilenceDuration >= audioDurationSec - tolerance;
  }

  return {
    hasLeadingSilence,
    isOnlySilence,
  };
}

export async function hasLeadingSilence(
  inputPath: string,
  options: SilenceInspectOptions,
): Promise<boolean> {
  const result = await inspectAudioSilence(inputPath, options);
  return result.hasLeadingSilence;
}

export async function trimLeadingSilence(
  inputPath: string,
  outputPath: string,
  options: {
    leadingSilenceDurationSec: number;
    trailingSilenceKeepSec: number;
    silenceNoiseThreshold: string;
  },
): Promise<void> {
  if (!ffmpegPath) {
    throw new Error("ffmpeg-static binary is not available");
  }

  const args = [
    "-hide_banner",
    "-nostats",
    "-i",
    inputPath,
    "-af",
    `silenceremove=start_periods=1:start_duration=${options.leadingSilenceDurationSec}:start_threshold=${options.silenceNoiseThreshold}:start_silence=${options.leadingSilenceDurationSec},areverse,silenceremove=start_periods=1:start_duration=${options.trailingSilenceKeepSec}:start_threshold=${options.silenceNoiseThreshold}:start_silence=${options.trailingSilenceKeepSec},areverse`,
    "-vn",
    "-codec:a",
    "libmp3lame",
    "-q:a",
    "2",
    outputPath,
  ];

  await runFfmpeg(ffmpegPath, args);
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

function extractSilenceDurationValues(logOutput: string): number[] {
  const values: number[] = [];
  const regex = /silence_duration:\s*([0-9]*\.?[0-9]+)/g;

  for (const match of logOutput.matchAll(regex)) {
    const parsed = Number(match[1]);

    if (!Number.isNaN(parsed)) {
      values.push(parsed);
    }
  }

  return values;
}

function extractAudioDurationSec(logOutput: string): number | null {
  const durationMatch = logOutput.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);

  if (!durationMatch) {
    return null;
  }

  const hours = Number(durationMatch[1]);
  const minutes = Number(durationMatch[2]);
  const seconds = Number(durationMatch[3]);

  if (Number.isNaN(hours) || Number.isNaN(minutes) || Number.isNaN(seconds)) {
    return null;
  }

  return hours * 3600 + minutes * 60 + seconds;
}
