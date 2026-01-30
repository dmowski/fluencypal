import { AddUsageLogRequest, AddUsageLogResponse } from '@/common/requests';

export const createUsageLog = async (requestData: AddUsageLogRequest, auth: string) => {
  if (requestData.usageLog.type === 'realtime' && requestData.usageLog.conversationId) {
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
  }
};
