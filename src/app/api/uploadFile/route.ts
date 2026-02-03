import { validateAuthToken, getBucket } from '../config/firebase';
import { UploadFileResponse } from './types';
import { sentSupportTelegramMessage } from '../telegram/sendTelegramMessage';

export async function POST(request: Request) {
  const data = await request.formData();
  const file = data.get('file') as File | null;

  if (!file) {
    const errorResponse: UploadFileResponse = {
      error: 'File not found',
      uploadUrl: '',
    };
    return Response.json(errorResponse, { status: 400 });
  }

  const urlQueryParams = request.url.split('?')[1];
  const urlParams = new URLSearchParams(urlQueryParams);
  const type = urlParams.get('type') || 'image';

  // Validate file type
  const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
  const validTypes = type === 'video' ? validVideoTypes : validImageTypes;

  if (!validTypes.includes(file.type)) {
    const errorResponse: UploadFileResponse = {
      error: `Invalid file type. Expected ${type}`,
      uploadUrl: '',
    };
    return Response.json(errorResponse, { status: 400 });
  }

  const userInfo = await validateAuthToken(request);
  const userEmail = userInfo.email || '';
  const userId = userInfo.uid || '';

  const actualFileSize = file?.size || 0;
  const actualFileSizeMb = actualFileSize / (1024 * 1024);
  const maxFileSize = 50 * 1024 * 1024; // 50 MB

  if (actualFileSize > maxFileSize) {
    sentSupportTelegramMessage({
      message: `User tried to upload huge ${type} file (${actualFileSizeMb.toFixed(2)}MB) | ${userEmail}`,
      userId,
    });

    const errorResponse: UploadFileResponse = {
      error: 'File size exceeds maximum limit of 50MB',
      uploadUrl: '',
    };
    return Response.json(errorResponse, { status: 413 });
  }

  try {
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'bin';
    const randomName = `${timestamp}-${userId}.${fileExtension}`;
    const folderPrefix = type === 'video' ? 'uploadedVideos' : 'uploadedImages';
    const filePath = `${folderPrefix}/${userId}/${randomName}`;

    const bucket = getBucket();
    const buffer = Buffer.from(await file.arrayBuffer());
    const storageFile = bucket.file(filePath);

    await storageFile.save(buffer, {
      contentType: file.type,
      resumable: false,
      metadata: {
        metadata: {
          uploadedAt: timestamp.toString(),
          uploadedBy: userId,
          originalName: file.name,
        },
      },
    });

    await storageFile.makePublic();
    const url = storageFile.publicUrl();

    const response: UploadFileResponse = {
      uploadUrl: url,
      error: null,
    };

    return Response.json(response);
  } catch (error) {
    console.error('Error during file upload:', error);
    console.error(JSON.stringify(error, null, 2));

    await sentSupportTelegramMessage({
      message: `Failed to upload ${type} file for user ${userEmail} (${actualFileSizeMb.toFixed(2)}MB)`,
      userId,
    });

    const errorResponse: UploadFileResponse = {
      error: 'Error during file upload',
      uploadUrl: '',
    };
    return Response.json(errorResponse, { status: 500 });
  }
}
