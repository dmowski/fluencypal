"use client";
import { CreateTelegramInvoiceRequest, CreateTelegramInvoiceResponse } from "./types";

export const sendCreateTelegramInvoiceRequest = async (
  input: CreateTelegramInvoiceRequest,
  auth: string
): Promise<CreateTelegramInvoiceResponse> => {
  const response = await fetch("/api/telegram/createInvoice", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth}`,
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Failed to send create invoice request");
  }

  return response.json();
};
