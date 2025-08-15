"use client";
import { Stack, Typography } from "@mui/material";
import { useAuth } from "../Auth/useAuth";
import { DEV_EMAILS } from "@/common/dev";
import { useEffect, useRef, useState } from "react";
import { loadStatsRequest } from "@/app/api/loadStats/loadStatsRequest";
import { AdminStatsResponse } from "@/app/api/loadStats/types";

export function AdminStats() {
  const auth = useAuth();
  const isAdmin = DEV_EMAILS.includes(auth?.userInfo?.email || "");
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);
  const [data, setData] = useState<AdminStatsResponse | null>(null);

  const loadStatsData = async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setIsLoading(true);
    const result = await loadStatsRequest(await auth.getToken());
    isLoadingRef.current = false;
    setIsLoading(false);
    setData(result);
  };

  useEffect(() => {
    if (!isAdmin || isLoading || isLoadingRef.current || data) return;
    loadStatsData();
  }, [isLoading, isAdmin]);

  return (
    <Stack
      sx={{
        paddingTop: "100px",
      }}
    >
      <Typography variant="h5">Stats</Typography>
      {isLoading && <Typography>Loading...</Typography>}
      {data && <Typography>Users: {data.users.length}</Typography>}
    </Stack>
  );
}
