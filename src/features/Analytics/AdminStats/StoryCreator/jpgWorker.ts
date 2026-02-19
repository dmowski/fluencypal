import type { JpgWorkerMessage, JpgWorkerResponse } from './jpgWorker/types';
import { loadFFmpeg } from './jpgWorker/ffmpegLoader';
import { convertImageToJpg } from './jpgWorker/conversion';

self.onmessage = async (e: MessageEvent<JpgWorkerMessage>) => {
  const { type, data } = e.data;

  try {
    if (type === 'load') {
      await loadFFmpeg();
    } else if (type === 'convert' && data?.imageData) {
      await convertImageToJpg(data.imageData, data.imageName || 'image');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : '';
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
