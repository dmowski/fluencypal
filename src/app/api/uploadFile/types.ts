export interface UploadFileRequest {
  file: File;
  type: 'image' | 'video';
  resizeImage?: boolean;
}

export interface UploadFileResponse {
  uploadUrl: string;
  error: string | null;
}
