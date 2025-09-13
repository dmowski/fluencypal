"use client";

export const sendDeleteMyAccountRequest = async (auth: string): Promise<void> => {
  const response = await fetch("/api/deleteAccount", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth}`,
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    throw new Error("Failed to send delete account request");
  }

  return response.json();
};
