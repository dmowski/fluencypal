import { getBucket } from '@/app/api/config/firebase';

const extensionFromContentType = (contentType: string): string => {
  if (contentType.includes('webm')) return 'webm';
  if (contentType.includes('ogg')) return 'ogg';
  if (contentType.includes('mp4') || contentType.includes('m4a')) return 'm4a';
  if (contentType.includes('mpeg') || contentType.includes('mp3')) return 'mp3';
  if (contentType.includes('wav')) return 'wav';
  return 'webm';
};

export const saveSpeakingAudio = async (params: {
  folder: string;
  id: string;
  buffer: Buffer;
  contentType: string;
}): Promise<{ audioPath: string; contentType: string }> => {
  const contentType = params.contentType || 'audio/webm';
  const extension = extensionFromContentType(contentType);
  const audioPath = `speakingClubs/audio/${params.folder}/${params.id}.${extension}`;
  const file = getBucket().file(audioPath);
  await file.save(params.buffer, {
    contentType,
    resumable: false,
  });
  return { audioPath, contentType };
};

export const deleteSpeakingAudio = async (audioPath: string): Promise<void> => {
  if (!audioPath.startsWith('speakingClubs/audio/')) return;
  try {
    await getBucket().file(audioPath).delete({ ignoreNotFound: true });
  } catch (error) {
    console.error('Failed to delete speaking club audio', audioPath, error);
  }
};

export const readSpeakingAudio = async (
  audioPath: string,
): Promise<{ buffer: Buffer; contentType: string } | null> => {
  if (!audioPath.startsWith('speakingClubs/audio/')) return null;
  const file = getBucket().file(audioPath);
  const [exists] = await file.exists();
  if (!exists) return null;
  const [buffer] = await file.download();
  const [metadata] = await file.getMetadata();
  return {
    buffer,
    contentType: metadata.contentType || 'audio/webm',
  };
};
