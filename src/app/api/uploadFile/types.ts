export interface UploadFileRequest {
  file: File;
  type: 'image' | 'video';
  maxSizePx?: number;
}

export interface UploadFileResponse {
  uploadUrl: string;
  error: string | null;
}
