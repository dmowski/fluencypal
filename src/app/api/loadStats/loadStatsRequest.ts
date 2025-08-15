import { AdminStatsResponse } from "./types";

export const loadStatsRequest = async (auth: string) => {
  const response = await fetch("/api/loadStats", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth}`,
    },
  });
  const data = (await response.json()) as AdminStatsResponse;
  return data;
};
