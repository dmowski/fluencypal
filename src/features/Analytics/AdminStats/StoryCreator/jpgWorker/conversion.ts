import type { JpgWorkerResponse } from './types';
import { getFFmpeg } from './state';

function getBaseName(fileName: string): string {
  const dotIndex = fileName.lastIndexOf('.');
  if (dotIndex <= 0) {
    return fileName || 'image';
  }
  return fileName.slice(0, dotIndex);
}

export async function convertImageToJpg(imageData: Uint8Array, imageName: string): Promise<void> {
  const ffmpeg = getFFmpeg();
  if (!ffmpeg) {
    throw new Error('FFmpeg not initialized');
  }

  const inputName = imageName || 'input-image';
  const outputName = `${getBaseName(inputName)}.jpg`;

  await ffmpeg.writeFile(inputName, imageData);

  self.postMessage({
    type: 'progress',
    data: { progress: 0 },
  } as JpgWorkerResponse);

  const exitCode = await ffmpeg.exec([
    '-i',
    inputName,
    '-q:v',
    '1',
    '-qmin',
    '1',
    '-qmax',
    '1',
    '-pix_fmt',
    'yuvj420p',
    outputName,
  ]);

  if (exitCode !== 0) {
    throw new Error(`FFmpeg conversion failed with exit code ${exitCode}`);
  }

  self.postMessage({
    type: 'progress',
    data: { progress: 80 },
  } as JpgWorkerResponse);

  const data = await ffmpeg.readFile(outputName);

  try {
    await ffmpeg.deleteFile(inputName);
    await ffmpeg.deleteFile(outputName);
  } catch {
    // Ignore cleanup errors.
  }

  self.postMessage({
    type: 'progress',
    data: { progress: 100 },
  } as JpgWorkerResponse);

  self.postMessage({
    type: 'complete',
    data: { imageData: data, imageName: outputName },
  } as JpgWorkerResponse);
}
