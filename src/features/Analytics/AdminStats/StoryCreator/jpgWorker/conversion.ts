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

  console.log('[jpgWorker/conversion] convertImageToJpg called', {
    inputName,
    outputName,
    inputBytes: imageData.byteLength,
  });

  console.log('[jpgWorker/conversion] Writing input file');
  await ffmpeg.writeFile(inputName, imageData);
  console.log('[jpgWorker/conversion] Input file written');

  self.postMessage({
    type: 'progress',
    data: { progress: 0 },
  } as JpgWorkerResponse);

  const args = [
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
  ];
  console.log('[jpgWorker/conversion] Running ffmpeg.exec', args);

  let exitCode: number;
  try {
    exitCode = await ffmpeg.exec(args);
  } catch (error) {
    console.error('[jpgWorker/conversion] ffmpeg.exec threw', error);
    throw error;
  }

  console.log('[jpgWorker/conversion] ffmpeg.exec finished', { exitCode });

  if (exitCode !== 0) {
    console.error('[jpgWorker/conversion] Conversion failed', {
      exitCode,
      inputName,
      outputName,
    });
    throw new Error(`FFmpeg conversion failed with exit code ${exitCode}`);
  }

  self.postMessage({
    type: 'progress',
    data: { progress: 80 },
  } as JpgWorkerResponse);

  console.log('[jpgWorker/conversion] Reading output file');
  const data = await ffmpeg.readFile(outputName);
  console.log('[jpgWorker/conversion] Output file read', { outputBytes: data.byteLength });

  try {
    console.log('[jpgWorker/conversion] Cleaning up temp files');
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
