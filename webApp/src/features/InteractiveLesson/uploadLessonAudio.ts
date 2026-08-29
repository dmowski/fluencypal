import { sendUploadFileRequest } from '@/app/api/uploadFile/sendUploadFileRequest';

export const uploadLessonAudio = async ({
  blob,
  lessonId,
  partIndex,
  token,
}: {
  blob: Blob;
  lessonId: string;
  partIndex: number;
  token: string;
}): Promise<string | null> => {
  const mimeType = (blob.type || 'audio/webm').split(';')[0].trim();
  const extension = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('wav') ? 'wav' : 'webm';
  const file = new File([blob], `interactive-lesson-${lessonId}-${partIndex}.${extension}`, {
    type: mimeType,
  });
  const result = await sendUploadFileRequest({ file, type: 'audio', visibility: 'private' }, token);
  if (result.error || !result.uploadUrl) return null;
  return result.uploadUrl;
};
