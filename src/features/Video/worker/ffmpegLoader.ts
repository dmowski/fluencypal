import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import type { WorkerResponse } from './types';
import { getFFmpeg, getIsLoading, setFFmpeg, setIsLoading } from './state';

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
    console.log('[Worker] Creating FFmpeg instance');
    const ffmpeg = new FFmpeg();
    setFFmpeg(ffmpeg);

    // Set up progress logging
    ffmpeg.on('log', ({ message }) => {
      console.log('[FFmpeg Log]', message);
    });

    ffmpeg.on('progress', ({ progress, time }) => {
      console.log('[FFmpeg Progress]', progress);
      self.postMessage({
        type: 'progress',
        data: { progress: Math.round(progress * 100), time },
      } as WorkerResponse);
    });

    // Load FFmpeg core from local service
    // Use absolute URL with origin to ensure proper resolution in worker context
    const baseURL = `${self.location.origin}/ffmpeg`;
    console.log('[Worker] Loading FFmpeg core from local service:', baseURL);

    let coreURL: string;
    try {
      coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
      console.log('[Worker] Core JS URL resolved:', coreURL);
    } catch (urlError) {
      const msg = urlError instanceof Error ? urlError.message : String(urlError);
      console.error('[Worker] Failed to resolve core JS URL:', msg);
      throw new Error(`Failed to load FFmpeg core JS: ${msg}`);
    }

    let wasmURL: string;
    try {
      wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');
      console.log('[Worker] Core WASM URL resolved:', wasmURL);
    } catch (wasmError) {
      const msg = wasmError instanceof Error ? wasmError.message : String(wasmError);
      console.error('[Worker] Failed to resolve WASM URL:', msg);
      throw new Error(`Failed to load FFmpeg WASM: ${msg}`);
    }

    console.log('[Worker] Calling ffmpeg.load()');
    try {
      await ffmpeg.load({
        coreURL,
        wasmURL,
      });
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
