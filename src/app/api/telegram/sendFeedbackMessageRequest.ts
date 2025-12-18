"use client";

import { TelegramRequest, TelegramResponse } from "@/common/requests";

export const sendFeedbackMessageRequest = async (message: TelegramRequest, auth: string) => {
  const response = await fetch("/api/telegram", {
    method: "POST",
    body: JSON.stringify(message),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth}`,
    },
  });
  const data = (await response.json()) as TelegramResponse;
  return data;
};
