import { AdminStatsRequest, AdminStatsResponse } from "./types";

export const loadStatsRequest = async (request: AdminStatsRequest, auth: string) => {
  const response = await fetch("/api/loadStats", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth}`,
    },
    body: JSON.stringify(request),
  });
  const data = (await response.json()) as AdminStatsResponse;
  return data;
};
