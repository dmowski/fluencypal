import { TelegramRequest, TelegramResponse } from "@/common/requests";

export const sendTelegramRequest = async (request: TelegramRequest) => {
  const response = await fetch("/api/telegram", {
    method: "POST",
    body: JSON.stringify(request),
  });
  const data = (await response.json()) as TelegramResponse;
  return data;
};
