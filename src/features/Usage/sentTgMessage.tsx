import { sendTelegramRequest } from "../Telegram/sendTextAiRequest";

const devEmails = ["dmowski.alex@gmail.com"];
export const sentPaymentTgMessage = async ({
  message,
  email,
  token,
}: {
  message: string;
  email: string;
  token: string;
}) => {
  if (!email) {
    sendTelegramRequest(
      {
        message: "Event: Payments. Someone trying to do with money, but no email",
      },
      token
    );
  }

  const isDevEmail = devEmails.includes(email);
  if (isDevEmail) {
    return;
  }

  sendTelegramRequest(
    {
      message: message,
    },
    token
  );
};
