interface FileValidationResult {
  isValid: boolean;
  error?: string;
  statusCode?: number;
}

export const validateUploadFile = (file: File, type: 'image' | 'video'): FileValidationResult => {
  // Validate file type
  const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
  const validTypes = type === 'video' ? validVideoTypes : validImageTypes;

  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type. Expected ${type}`,
      statusCode: 400,
    };
  }

  // Validate file size (50MB)
  const actualFileSize = file?.size || 0;
  const maxFileSize = 50 * 1024 * 1024;

  if (actualFileSize > maxFileSize) {
    return {
      isValid: false,
      error: 'File size exceeds maximum limit of 50MB',
      statusCode: 413,
    };
  }

  return { isValid: true };
};
