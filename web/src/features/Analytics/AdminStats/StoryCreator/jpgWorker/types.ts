export interface JpgWorkerMessage {
  type: 'load' | 'convert';
  data?: {
    imageData?: Uint8Array;
    imageName?: string;
  };
}

export interface JpgWorkerResponse {
  type: 'loaded' | 'progress' | 'complete' | 'error';
  data?: unknown;
}
