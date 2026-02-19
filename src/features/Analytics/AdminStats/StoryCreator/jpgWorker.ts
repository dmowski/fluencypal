import type { JpgWorkerMessage, JpgWorkerResponse } from './jpgWorker/types';
import { loadFFmpeg } from './jpgWorker/ffmpegLoader';
import { convertImageToJpg } from './jpgWorker/conversion';

const JPG_WORKER_BUILD_TAG = 'jpg-worker-2026-02-19-v3';
console.log('[jpgWorker] Booted', { workerBuildTag: JPG_WORKER_BUILD_TAG });

self.onmessage = async (e: MessageEvent<JpgWorkerMessage>) => {
  const { type, data } = e.data;
  console.log('[jpgWorker] Message received:', type, {
    hasData: !!data,
    imageBytes: data?.imageData?.byteLength,
    imageName: data?.imageName,
  });

  try {
    if (type === 'load') {
      console.log('[jpgWorker] Starting FFmpeg load');
      await loadFFmpeg();
      console.log('[jpgWorker] FFmpeg load completed');
    } else if (type === 'convert' && data?.imageData) {
      console.log('[jpgWorker] Starting image conversion');
      await convertImageToJpg(data.imageData, data.imageName || 'image');
      console.log('[jpgWorker] Image conversion completed');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : '';
    console.error('[jpgWorker] Error:', errorMessage);
    console.error('[jpgWorker] Stack:', stack);
    console.error('[jpgWorker] Full error:', error);
    self.postMessage({
      type: 'error',
      data: {
        message: errorMessage || 'Unknown error occurred',
        stack,
        fullError: String(error),
      },
    } as JpgWorkerResponse);
  }
};
