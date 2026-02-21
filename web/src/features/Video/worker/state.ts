export type FFmpegLike = {
  on: (event: "log" | "progress", cb: (payload: { message?: string; progress?: number; time?: number }) => void) => void;
  load: (options: { coreURL: string; wasmURL: string; workerURL?: string }) => Promise<void>;
  exec: (args: string[]) => Promise<number>;
  writeFile: (path: string, data: Uint8Array) => Promise<void>;
  readFile: (path: string) => Promise<Uint8Array>;
  listDir: (path: string) => Promise<unknown>;
  deleteFile: (path: string) => Promise<void>;
};

let ffmpeg: FFmpegLike | null = null;
let isLoading = false;

export function getFFmpeg(): FFmpegLike | null {
  return ffmpeg;
}

export function setFFmpeg(instance: FFmpegLike | null): void {
  ffmpeg = instance;
}

export function getIsLoading(): boolean {
  return isLoading;
}

export function setIsLoading(value: boolean): void {
  isLoading = value;
}
