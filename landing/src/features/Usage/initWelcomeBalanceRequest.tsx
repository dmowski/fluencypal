import { InitBalanceRequest, InitBalanceResponse } from '@/app/api/addUsageLog/usageRequest.types';

export const initWelcomeBalanceRequest = async (requestData: InitBalanceRequest, auth: string) => {
  const response = await fetch('/api/initBalance', {
    method: 'POST',
    body: JSON.stringify(requestData),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth}`,
    },
  });
  const data = (await response.json()) as InitBalanceResponse;
  return data;
};
