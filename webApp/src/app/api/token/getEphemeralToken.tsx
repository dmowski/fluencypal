import { getRandomAiToken, logUserTokenUsage } from '../sendSdpOffer/getRanomToken';

const openAIKeyDev = process.env.OPENAI_API_KEY_WEB_RTC || '';

export const getEphemeralToken = async (model: string, userId: string) => {
  const openAIKeyConfig = await getRandomAiToken();
  const openAIKey = openAIKeyConfig.token;

  await logUserTokenUsage(userId, openAIKeyConfig.id);

  if (!openAIKey) {
    throw new Error('Unable to create ephemeral token. Open AI env key is missing');
  }

  if (!model) {
    throw new Error('Model is required');
  }

  try {
    const r = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session: {
          type: 'realtime',
          model,
          audio: {
            output: {
              voice: 'verse',
            },
          },
        },
      }),
    });

    const data = await r.json();
    if (!data?.value) {
      console.error('Unable to create ephemeral token', data);
      throw new Error('Unable to create ephemeral token. No client secret found');
    }

    return data.value as string;
  } catch (error) {
    console.error('Error fetching ephemeral token:', error);
    console.log(error);
    throw new Error('Unable to create ephemeral token. Failed to fetch from OpenAI API');
  }
};
