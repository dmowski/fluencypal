import { getBucket } from '../config/firebase';
import { resizeImage } from './resizeImage';

interface UploadFileOptions {
  file: File;
  userId: string;
  type: 'image' | 'video';
  maxSizePx?: number;
}

interface UploadFileResult {
  success: boolean;
  uploadUrl?: string;
  error?: string;
}

export const uploadFileToStorage = async ({
  file,
  userId,
  type,
  maxSizePx,
}: UploadFileOptions): Promise<UploadFileResult> => {
  try {
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'bin';
    const randomName = `${timestamp}-${userId}.${fileExtension}`;
    const folderPrefix = type === 'video' ? 'uploadedVideos' : 'uploadedImages';
    const filePath = `${folderPrefix}/${userId}/${randomName}`;

    const bucket = getBucket();
    let buffer: Buffer = Buffer.from(await file.arrayBuffer());

    // Resize image if maxSizePx is provided and file is an image
    if (type === 'image' && maxSizePx) {
      const resizeResult = await resizeImage({ buffer, maxSizePx });
      if (!resizeResult.success) {
        return {
          success: false,
          error: resizeResult.error || 'Failed to resize image',
        };
      }
      if (resizeResult.buffer) {
        buffer = Buffer.from(resizeResult.buffer);
      }
    }

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

    return {
      success: true,
      uploadUrl: url,
    };
  } catch (error) {
    console.error('Error during file upload:', error);
    console.error(JSON.stringify(error, null, 2));

    return {
      success: false,
      error: 'Error during file upload',
    };
  }
};
