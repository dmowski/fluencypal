export interface UploadFileRequest {
  file: File;
  type: 'image' | 'video';
}

export interface UploadFileResponse {
  uploadUrl: string;
  error: string | null;
}
