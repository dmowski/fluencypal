"use client";
import { Link, Stack, Typography } from "@mui/material";
import { useAuth } from "../Auth/useAuth";
import { DEV_EMAILS } from "@/common/dev";
import { useEffect, useRef, useState } from "react";
import { loadStatsRequest } from "@/app/api/loadStats/loadStatsRequest";
import { AdminStatsResponse, UserStat } from "@/app/api/loadStats/types";
import dayjs from "dayjs";
import { getFirebaseLink } from "../Firebase/getFirebaseLink";
import { useGame } from "../Game/useGame";

const UserCard = ({ userStat }: { userStat: UserStat }) => {
  const game = useGame();
  const user = userStat.userData;
  const lastLoginAgo = user.lastLoginAtDateTime
    ? dayjs(user.lastLoginAtDateTime).fromNow()
    : "Never";

  const isToday =
    user.lastLoginAtDateTime && dayjs(user.lastLoginAtDateTime).isSame(dayjs(), "day");

  const firebaseLink = getFirebaseLink(user.id);
  const countryName = user.countryName || "";
  const currency = user.currency || "";
  const photoUrl = user.photoUrl || "";
  const displayName = user.displayName || "";
  const countryImage = user.country
    ? `https://flagsapi.com/${user.country.toUpperCase()}/flat/64.png`
    : "";

  const conversationCount = userStat.conversationCount;
  const lastConversationDateTime = userStat.lastConversationDateTime;
  const lastConversationAgo = lastConversationDateTime
    ? dayjs(lastConversationDateTime).fromNow()
    : "Never";

  const gameProfile = userStat.gameProfile;
  const gameUsername = gameProfile?.username || "";
  const userStats = game.stats.find((s) => s.username === gameProfile?.username);
  const gameAvatar = game.gameAvatars[userStats?.username || "default"];

  return (
    <Stack
      sx={{
        border: isToday ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid transparent",
        borderRadius: "10px",
        padding: "14px 25px",
        flexDirection: "row",
        alignItems: "center",
        gap: "25px",
      }}
    >
      <Stack>
        <img
          src={photoUrl || "/logo192.png"}
          alt={displayName}
          style={{
            borderRadius: "50%",
            width: "60px",
            height: "60px",
            border: "1px solid  rgba(255, 255, 255, 0.1)",
          }}
        />
      </Stack>
      <Stack>
        <Link href={firebaseLink} variant="h6" target="_blank" rel="noopener noreferrer">
          {user.email}
        </Link>
        <Typography variant="caption">
          <b>{lastLoginAgo}</b> - login
        </Typography>
        <Typography variant="caption">
          <b>{lastConversationAgo}</b> - conversations ({conversationCount})
        </Typography>
        <Stack
          sx={{
            flexDirection: "row",
            alignItems: "center",
            gap: "8px",
            padding: "4px 0",
          }}
        >
          {countryImage && (
            <img
              src={countryImage}
              alt={countryName}
              style={{ borderRadius: "4px", width: "24px", height: "24px" }}
            />
          )}
          <Typography variant="caption">
            {[countryName, currency, displayName].filter(Boolean).join(" | ")}
          </Typography>
        </Stack>

        <Stack
          sx={{
            flexDirection: "row",
            alignItems: "center",
            gap: "8px",
            padding: "4px 0",
          }}
        >
          {gameAvatar && (
            <img
              src={gameAvatar}
              alt={countryName}
              style={{ borderRadius: "34px", width: "24px", height: "24px" }}
            />
          )}
          <Typography variant="caption">
            {[gameUsername, userStats?.points].filter(Boolean).join(" | ")}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};

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

  const users =
    data?.users.sort((a, b) => {
      const aLostLogins = a.userData.lastLoginAtDateTime || ""; // iso string
      const bLostLogins = b.userData.lastLoginAtDateTime || ""; // iso string
      if (!aLostLogins && !bLostLogins) return 0;
      if (!aLostLogins) return 1;
      if (!bLostLogins) return -1;
      return dayjs(bLostLogins).diff(dayjs(aLostLogins));
    }) || [];

  const todayUsers = users.filter((user) => {
    const lastLogin = user.userData.lastLoginAtDateTime;
    return lastLogin && dayjs(lastLogin).isSame(dayjs(), "day");
  });

  if (!isAdmin) {
    return <></>;
  }

  return (
    <Stack
      sx={{
        paddingTop: "100px",
      }}
    >
      {isLoading && <Typography>Loading...</Typography>}
      {data && (
        <>
          <Typography variant="h6">Users: {data.users.length}</Typography>
          <Typography variant="h6">Today users: {todayUsers.length}</Typography>
          <Stack
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "36px",
              padding: "20px 10px",
            }}
          >
            {users.map((user) => (
              <UserCard key={user.userData.id} userStat={user} />
            ))}
          </Stack>
        </>
      )}
    </Stack>
  );
}
