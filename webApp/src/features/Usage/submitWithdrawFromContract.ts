import {
  WithdrawFromContractRequest,
  WithdrawFromContractResponse,
} from './withdrawal.types';

export const submitWithdrawFromContract = async (
  request: WithdrawFromContractRequest,
  authToken: string,
): Promise<WithdrawFromContractResponse> => {
  const response = await fetch('/api/payment/withdrawFromContract', {
    method: 'POST',
    body: JSON.stringify(request),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
  });

  const data = (await response.json()) as WithdrawFromContractResponse;
  return data;
};
