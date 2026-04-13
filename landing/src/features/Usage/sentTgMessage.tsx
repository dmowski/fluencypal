import { sendTelegramRequest } from '../Telegram/sendTextAiRequest';

const devEmails = ['dmowski.alex@gmail.com'];
export const sentPaymentTgMessage = async ({
  message,
  email,
  token,
}: {
  message: string;
  email: string;
  token: string;
}) => {
  const isDevEmail = devEmails.includes(email);
  if (isDevEmail) {
    return;
  }

  await sendTelegramRequest(
    {
      message: message,
    },
    token,
  );
};
