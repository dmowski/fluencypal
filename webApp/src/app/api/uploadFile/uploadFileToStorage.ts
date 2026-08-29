import { getBucket } from '../config/firebase';
interface UploadFileOptions {
  file: File;
  userId: string;
  type: 'image' | 'video' | 'audio';
  isPublic?: boolean;
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
  isPublic = true,
}: UploadFileOptions): Promise<UploadFileResult> => {
  try {
    const timestamp = Date.now();

    let fileExtension = file.name.split('.').pop() || 'bin';

    const bucket = getBucket();
    let buffer: Buffer = Buffer.from(await file.arrayBuffer());

    const randomName = `${timestamp}-${userId}.${fileExtension}`;
    const folderPrefix =
      type === 'video' ? 'uploadedVideos' : type === 'audio' ? 'uploadedAudios' : 'uploadedImages';

    const filePath = `${folderPrefix}/${userId}/${randomName}`;
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

    if (isPublic) {
      await storageFile.makePublic();
      return {
        success: true,
        uploadUrl: storageFile.publicUrl(),
      };
    }

    return {
      success: true,
      uploadUrl: `/api/uploadFile?path=${encodeURIComponent(filePath)}`,
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
