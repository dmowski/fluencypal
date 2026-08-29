import { getBucket, validateAuthToken } from '../config/firebase';
import { UploadFileResponse } from './types';
import { sentSupportTelegramMessage } from '../telegram/sendTelegramMessage';
import { validateUploadFile } from './validateUploadFile';
import { uploadFileToStorage } from './uploadFileToStorage';

export async function POST(request: Request) {
  const data = await request.formData();
  const file = data.get('file') as File | null;

  if (!file) {
    console.error('[uploadFile] 400 – no file in form data');
    const errorResponse: UploadFileResponse = {
      error: 'File not found',
      uploadUrl: '',
    };
    return Response.json(errorResponse, { status: 400 });
  }

  const urlQueryParams = request.url.split('?')[1];
  const urlParams = new URLSearchParams(urlQueryParams);
  const type = (urlParams.get('type') || 'image') as 'image' | 'video' | 'audio';
  const isPublic = urlParams.get('visibility') !== 'private';

  // Validate file
  const validation = validateUploadFile(file, type);
  if (!validation.isValid) {
    console.error(
      `[uploadFile] 400 – validation failed | type=${type} mimeType=${file.type} size=${file.size} error=${validation.error}`,
    );
    const errorResponse: UploadFileResponse = {
      error: validation.error || 'Validation failed',
      uploadUrl: '',
    };
    return Response.json(errorResponse, { status: validation.statusCode || 400 });
  }

  const userInfo = await validateAuthToken(request);
  const userEmail = userInfo.email || '';
  const userId = userInfo.uid || '';

  const actualFileSize = file?.size || 0;
  const actualFileSizeMb = actualFileSize / (1024 * 1024);

  // Notify if file is too large
  if (actualFileSize > 50 * 1024 * 1024) {
    sentSupportTelegramMessage({
      message: `User tried to upload huge ${type} file (${actualFileSizeMb.toFixed(2)}MB) | ${userEmail}`,
      userId,
    });
  }

  // Upload file to storage
  const uploadResult = await uploadFileToStorage({
    file,
    userId,
    type,
    isPublic,
  });

  if (!uploadResult.success) {
    console.error(
      `[uploadFile] 500 – storage upload failed | type=${type} userId=${userId} error=${uploadResult.error}`,
    );
    await sentSupportTelegramMessage({
      message: `Failed to upload ${type} file for user ${userEmail} (${actualFileSizeMb.toFixed(2)}MB)`,
      userId,
    });

    const errorResponse: UploadFileResponse = {
      error: uploadResult.error || 'Error during file upload',
      uploadUrl: '',
    };
    return Response.json(errorResponse, { status: 500 });
  }

  const response: UploadFileResponse = {
    uploadUrl: uploadResult.uploadUrl || '',
    error: null,
  };

  return Response.json(response);
}

const isOwnedUploadPath = (filePath: string, userId: string) => {
  if (!filePath || filePath.includes('..') || filePath.includes('\\')) return false;
  return (
    filePath.startsWith(`uploadedAudios/${userId}/`) ||
    filePath.startsWith(`uploadedImages/${userId}/`) ||
    filePath.startsWith(`uploadedVideos/${userId}/`)
  );
};

export async function GET(request: Request) {
  const userInfo = await validateAuthToken(request);
  const userId = userInfo.uid || '';
  const filePath = new URL(request.url).searchParams.get('path') || '';

  if (!isOwnedUploadPath(filePath, userId)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const storageFile = getBucket().file(filePath);
    const [exists] = await storageFile.exists();
    if (!exists) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    const [buffer] = await storageFile.download();
    const [metadata] = await storageFile.getMetadata();
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': metadata.contentType || 'application/octet-stream',
        'Cache-Control': 'private, max-age=300',
      },
    });
  } catch (error) {
    console.error('[uploadFile] GET failed', { userId, filePath, error });
    return Response.json({ error: 'Failed to read file' }, { status: 500 });
  }
}
