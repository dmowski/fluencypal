export interface UploadFileRequest {
  file: File;
  type: 'image' | 'video' | 'audio';
}

export interface UploadFileResponse {
  uploadUrl: string;
  error: string | null;
}
