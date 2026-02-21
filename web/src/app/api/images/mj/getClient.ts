import { Midjourney } from 'midjourney';

let internalClient: Midjourney | null = null;

export const getClient = async () => {
  if (internalClient) {
    return internalClient;
  }

  console.log('Creating new Midjourney client');
  const client = new Midjourney({
    ServerId: process.env.MJ_SERVER_ID,
    ChannelId: process.env.MJ_CHANNEL_ID,
    SalaiToken: process.env.MJ_SALAI_TOKEN as string,
    Debug: false,
    Ws: true,
  });
  await client.init();
  internalClient = client;

  return client;
};
