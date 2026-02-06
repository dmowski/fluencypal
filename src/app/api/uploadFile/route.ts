import { validateAuthToken } from '../config/firebase';
import { UploadFileResponse } from './types';
import { sentSupportTelegramMessage } from '../telegram/sendTelegramMessage';
import { validateUploadFile } from './validateUploadFile';
import { uploadFileToStorage } from './uploadFileToStorage';

export async function POST(request: Request) {
  const data = await request.formData();
  const file = data.get('file') as File | null;

  const isE2EBypass = process.env.E2E_UPLOAD_BYPASS === 'true';

  if (!file) {
    const errorResponse: UploadFileResponse = {
      error: 'File not found',
      uploadUrl: '',
    };
    return Response.json(errorResponse, { status: 400 });
  }

  const urlQueryParams = request.url.split('?')[1];
  const urlParams = new URLSearchParams(urlQueryParams);
  const type = (urlParams.get('type') || 'image') as 'image' | 'video';

  // Validate file
  const validation = validateUploadFile(file, type);
  if (!validation.isValid) {
    const errorResponse: UploadFileResponse = {
      error: validation.error || 'Validation failed',
      uploadUrl: '',
    };
    return Response.json(errorResponse, { status: validation.statusCode || 400 });
  }

  if (isE2EBypass) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || (type === 'video' ? 'video/webm' : 'image/png');
    const uploadUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
    const response: UploadFileResponse = {
      uploadUrl,
      error: null,
    };
    return Response.json(response);
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
  });

  if (!uploadResult.success) {
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
