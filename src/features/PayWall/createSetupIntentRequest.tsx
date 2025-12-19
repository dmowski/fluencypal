"use client";
import { SetupIntentRequest, SetupIntentResponse } from "@/app/api/payment/type";

export const createSetupIntentRequest = async (
  req: SetupIntentRequest,
  authToken: string
): Promise<SetupIntentResponse> => {
  const response = await fetch("/api/payment/createSetupIntent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(req),
  });

  if (!response.ok) {
    throw new Error("Failed to create setup intent");
  }

  return response.json();
};
