/// <reference lib="webworker" />

import type { JpgWorkerResponse } from './types';
import type { FFmpegLike } from './state';
import { getFFmpeg, getIsLoading, setFFmpeg, setIsLoading } from './state';

type FFmpegModule = {
  FFmpeg: new () => FFmpegLike;
};

export async function loadFFmpeg(): Promise<void> {
  const existing = getFFmpeg();
  const loading = getIsLoading();

  if (existing && !loading) {
    console.log('[jpgWorker/ffmpegLoader] FFmpeg already loaded');
    self.postMessage({ type: 'loaded' } as JpgWorkerResponse);
    return;
  }

  if (loading) {
    console.log('[jpgWorker/ffmpegLoader] FFmpeg loading in progress, waiting');
    let attempts = 0;
    while (getIsLoading() && attempts < 100) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }
    if (getFFmpeg()) {
      self.postMessage({ type: 'loaded' } as JpgWorkerResponse);
      return;
    }
  }

  setIsLoading(true);

  try {
    const baseURL = `${self.location.origin}/ffmpeg`;
    const ffmpegModuleUrl = `${baseURL}/ffmpeg/index.js`;
    console.log('[jpgWorker/ffmpegLoader] Importing FFmpeg module from', ffmpegModuleUrl);

    const ffmpegModule = (await import(/* webpackIgnore: true */ ffmpegModuleUrl)) as FFmpegModule;

    if (!ffmpegModule?.FFmpeg) {
      throw new Error('FFmpeg module failed to load from local assets');
    }

    const ffmpeg = new ffmpegModule.FFmpeg();
    setFFmpeg(ffmpeg);

    ffmpeg.on('log', ({ message }) => {
      if (message) {
        console.log('[jpgWorker/ffmpeg log]', message);
      }
    });

    ffmpeg.on('progress', ({ progress, time }) => {
      self.postMessage({
        type: 'progress',
        data: { progress: Math.round((progress ?? 0) * 100), time },
      } as JpgWorkerResponse);
    });

    const coreURL = `${baseURL}/ffmpeg-core.js`;
    const wasmURL = `${baseURL}/ffmpeg-core.wasm`;
    const workerURL = `${baseURL}/ffmpeg/worker.js`;
    console.log('[jpgWorker/ffmpegLoader] Loading FFmpeg core', { coreURL, wasmURL, workerURL });

    await ffmpeg.load({ coreURL, wasmURL, workerURL });
    console.log('[jpgWorker/ffmpegLoader] FFmpeg loaded successfully');

    setIsLoading(false);
    self.postMessage({ type: 'loaded' } as JpgWorkerResponse);
  } catch (error) {
    setIsLoading(false);
    console.error('[jpgWorker/ffmpegLoader] Failed to load FFmpeg', error);
    throw error;
  }
}
