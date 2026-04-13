import { AddUsageLogRequest, AddUsageLogResponse } from '@/app/api/addUsageLog/usageRequest.types';

const createUsageLogRaw = async (requestData: AddUsageLogRequest, auth: string) => {
  const response = await fetch('/api/addUsageLog', {
    method: 'POST',
    body: JSON.stringify(requestData),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth}`,
    },
  });
  const data = (await response.json()) as AddUsageLogResponse;
  return data;
};

export const createUsageLog = async (
  requestData: AddUsageLogRequest,
  auth: string,
  retries = 3,
): Promise<AddUsageLogResponse> => {
  try {
    return await createUsageLogRaw(requestData, auth);
  } catch (error) {
    if (retries > 0) {
      console.warn(`createUsageLog failed. Retrying... (${retries} attempts left)`, error);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
      return createUsageLog(requestData, auth, retries - 1);
    } else {
      console.error('createUsageLog failed after multiple attempts:', error);
      throw error;
    }
  }
};
