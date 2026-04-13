/// <reference lib="webworker" />

import type { WorkerResponse } from './types';
import type { FFmpegLike } from './state';
import { getFFmpeg, getIsLoading, setFFmpeg, setIsLoading } from './state';

type FFmpegModule = {
  FFmpeg: new () => FFmpegLike;
};

export async function loadFFmpeg(): Promise<void> {
  const existing = getFFmpeg();
  const loading = getIsLoading();

  if (existing && !loading) {
    console.log('[Worker] FFmpeg already loaded');
    self.postMessage({ type: 'loaded' } as WorkerResponse);
    return;
  }

  if (loading) {
    console.log('[Worker] FFmpeg already loading, waiting...');
    // Wait for it to finish
    let attempts = 0;
    while (getIsLoading() && attempts < 100) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }
    if (getFFmpeg()) {
      self.postMessage({ type: 'loaded' } as WorkerResponse);
      return;
    }
  }

  setIsLoading(true);

  try {
    console.log('[Worker] Loading FFmpeg ESM module from local public assets');

    const baseURL = `${self.location.origin}/ffmpeg`;
    const ffmpegModuleUrl = `${baseURL}/ffmpeg/index.js`;

    let ffmpegModule: FFmpegModule | null = null;
    try {
      ffmpegModule = (await import(
        /* webpackIgnore: true */ ffmpegModuleUrl
      )) as FFmpegModule;
    } catch (moduleError) {
      const msg = moduleError instanceof Error ? moduleError.message : String(moduleError);
      console.error('[Worker] Failed to import FFmpeg module:', ffmpegModuleUrl, msg);
    }

    if (!ffmpegModule?.FFmpeg) {
      throw new Error('FFmpeg module failed to load from local assets');
    }

    console.log('[Worker] Creating FFmpeg instance');
    const ffmpeg = new ffmpegModule.FFmpeg();
    setFFmpeg(ffmpeg);

    // Set up progress logging
    ffmpeg.on('log', ({ message }) => {
      if (message) {
        console.log('[FFmpeg Log]', message);
      }
    });

    ffmpeg.on('progress', ({ progress, time }) => {
      if (typeof progress === 'number') {
        console.log('[FFmpeg Progress]', progress);
      }
      self.postMessage({
        type: 'progress',
        data: { progress: Math.round((progress ?? 0) * 100), time },
      } as WorkerResponse);
    });

    // Load FFmpeg core files from local public assets
    const coreURL = `${baseURL}/ffmpeg-core.js`;
    const wasmURL = `${baseURL}/ffmpeg-core.wasm`;
    const workerURL = `${baseURL}/ffmpeg/worker.js`;
    console.log('[Worker] Using FFmpeg core URLs:', { coreURL, wasmURL, workerURL });

    try {
      await ffmpeg.load({ coreURL, wasmURL, workerURL });
    } catch (loadError) {
      const msg = loadError instanceof Error ? loadError.message : String(loadError);
      console.error('[Worker] FFmpeg.load() failed:', msg);
      throw new Error(`FFmpeg initialization failed: ${msg}`);
    }

    console.log('[Worker] FFmpeg.load() completed successfully');
    setIsLoading(false);
    self.postMessage({ type: 'loaded' } as WorkerResponse);
  } catch (error) {
    setIsLoading(false);
    const errorMessage = error instanceof Error ? error.message : 'Failed to load FFmpeg';
    console.error('[Worker] FFmpeg load error:', errorMessage);
    console.error('[Worker] Full error:', error);
    throw error;
  }
}
