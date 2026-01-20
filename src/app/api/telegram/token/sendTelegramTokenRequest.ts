"use client";
import { TelegramAuthRequest, TelegramAuthResponse } from "./types";

export const sendTelegramTokenRequest = async (
  input: TelegramAuthRequest,
): Promise<TelegramAuthResponse> => {
  const response = await fetch("/api/telegram/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Failed to send token request");
  }

  return response.json();
};
