import { UploadFileResponse, UploadFileRequest } from './types';

export const sendUploadFileRequest = async (data: UploadFileRequest, auth: string) => {
  const formData = new FormData();
  formData.append('file', data.file);

  const response = await fetch(`/api/uploadFile?type=${data.type}`, {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Bearer ${auth}`,
    },
  });
  const result = (await response.json()) as UploadFileResponse;
  return result;
};
