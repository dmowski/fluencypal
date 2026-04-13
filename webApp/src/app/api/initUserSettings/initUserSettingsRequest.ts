import { InitUserSettingsRequest, InitUserSettingsResponse } from './types';

export const initUserSettingsRequest = async (
  request: InitUserSettingsRequest,
  auth: string,
): Promise<InitUserSettingsResponse> => {
  const response = await fetch('/api/initUserSettings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Failed to initialize user settings');
  }

  return response.json() as Promise<InitUserSettingsResponse>;
};
