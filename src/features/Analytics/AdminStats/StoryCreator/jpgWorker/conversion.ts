import type { JpgWorkerResponse } from './types';
import { getFFmpeg } from './state';

function getBaseName(fileName: string): string {
  const dotIndex = fileName.lastIndexOf('.');
  if (dotIndex <= 0) {
    return fileName || 'image';
  }
  return fileName.slice(0, dotIndex);
}

function getExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf('.');
  if (dotIndex <= 0 || dotIndex === fileName.length - 1) {
    return 'img';
  }
  return fileName.slice(dotIndex + 1);
}

function sanitizeFileName(fileName: string): string {
  const normalized = fileName.trim().toLowerCase();
  const withoutPath = normalized.split('/').pop() || normalized;
  const decoded = withoutPath.replace(/%[0-9a-f]{2}/gi, '_');
  const safe = decoded.replace(/[^a-z0-9._-]/g, '_').replace(/_+/g, '_');
  return safe || 'image';
}

export async function convertImageToJpg(imageData: Uint8Array, imageName: string): Promise<void> {
  const ffmpeg = getFFmpeg();
  if (!ffmpeg) {
    throw new Error('FFmpeg not initialized');
  }

  const safeOriginalName = sanitizeFileName(imageName || 'image');
  const inputExt = getExtension(safeOriginalName);
  const inputName = `input.${inputExt}`;
  const outputName = 'output.jpg';
  const finalName = `${getBaseName(safeOriginalName)}.jpg`;

  console.log('[jpgWorker/conversion] convertImageToJpg called', {
    inputName,
    outputName,
    finalName,
    inputBytes: imageData.byteLength,
  });

  console.log('[jpgWorker/conversion] Writing input file');
  await ffmpeg.writeFile(inputName, imageData);
  console.log('[jpgWorker/conversion] Input file written');

  self.postMessage({
    type: 'progress',
    data: { progress: 0 },
  } as JpgWorkerResponse);

  const args = ['-i', inputName, '-frames:v', '1', '-q:v', '2', outputName];
  console.log('[jpgWorker/conversion] Running ffmpeg.exec', args);

  let exitCode: number;
  try {
    const execPromise = ffmpeg.exec(args);
    const timeoutPromise = new Promise<number>((_, reject) => {
      setTimeout(() => reject(new Error('FFmpeg JPG conversion timeout after 120s')), 120000);
    });
    exitCode = await Promise.race([execPromise, timeoutPromise]);
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
    data: { imageData: data, imageName: finalName },
  } as JpgWorkerResponse);
}
