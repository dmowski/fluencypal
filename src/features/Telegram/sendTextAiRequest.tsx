import { TelegramRequest, TelegramResponse } from "@/common/requests";

export const sendTelegramRequest = async (request: TelegramRequest, authToken: string) => {
  const response = await fetch("/api/telegram", {
    method: "POST",
    body: JSON.stringify(request),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
  const data = (await response.json()) as TelegramResponse;
  return data;
};
