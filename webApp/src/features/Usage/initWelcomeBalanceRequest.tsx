import { InitBalanceRequest, InitBalanceResponse } from '@/app/api/addUsageLog/usageRequest.types';

const initWelcomeBalanceRequestRaw = async (
  requestData: InitBalanceRequest,
  auth: string,
): Promise<InitBalanceResponse> => {
  const response = await fetch('/api/initBalance', {
    method: 'POST',
    body: JSON.stringify(requestData),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth}`,
    },
  });

  if (!response.ok) {
    throw new Error(`initWelcomeBalanceRequest failed with status ${response.status}`);
  }

  return (await response.json()) as InitBalanceResponse;
};

export const initWelcomeBalanceRequest = async (
  requestData: InitBalanceRequest,
  auth: string,
  retries = 3,
): Promise<InitBalanceResponse> => {
  try {
    return await initWelcomeBalanceRequestRaw(requestData, auth);
  } catch (error) {
    if (retries > 0) {
      console.warn(
        `initWelcomeBalanceRequest failed. Retrying... (${retries} attempts left)`,
        error,
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return initWelcomeBalanceRequest(requestData, auth, retries - 1);
    }

    console.error('initWelcomeBalanceRequest failed after multiple attempts:', error);
    throw error;
  }
};
