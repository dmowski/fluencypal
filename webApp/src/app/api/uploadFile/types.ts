export interface UploadFileRequest {
  file: File;
  type: 'image' | 'video' | 'audio';
  visibility?: 'public' | 'private';
}

export interface UploadFileResponse {
  uploadUrl: string;
  error: string | null;
}
