import { UploadFileResponse, UploadFileRequest } from './types';

export const sendUploadFileRequest = async (data: UploadFileRequest, auth: string) => {
  const formData = new FormData();
  formData.append('file', data.file);

  const params = new URLSearchParams({ type: data.type });
  if (data.maxSizePx) {
    params.append('maxSizePx', data.maxSizePx.toString());
  }

  const response = await fetch(`/api/uploadFile?${params.toString()}`, {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Bearer ${auth}`,
    },
  });
  const result = (await response.json()) as UploadFileResponse;
  return result;
};
