"use client";
import { Button, Card, Link, Stack, TextField, Typography } from "@mui/material";
import { useAuth } from "../Auth/useAuth";
import { DEV_EMAILS } from "@/common/dev";
import { useEffect, useMemo, useRef, useState } from "react";
import { loadStatsRequest } from "@/app/api/loadStats/loadStatsRequest";
import { AdminStatsResponse, UserStat } from "@/app/api/loadStats/types";
import dayjs from "dayjs";
import { getFirebaseLink } from "../Firebase/getFirebaseLink";
import { useGame } from "../Game/useGame";
import { fullEnglishLanguageName, SupportedLanguage } from "../Lang/lang";
import { BadgeCheck, Check, Copy, Gem } from "lucide-react";
import { defaultAvatar } from "../Game/avatars";

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    alert("Failed to copy text. Please copy it manually.");
    console.error("Failed to copy text: ", err);
  }
};

const UserCard = ({ userStat, allTextInfo }: { userStat: UserStat; allTextInfo: string }) => {
  const game = useGame();
  const [isQuizFull, setIsQuizFull] = useState(false);
  const user = userStat.userData;
  const userId = user.id;
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

  const totalMessages = userStat.conversationMeta.totalMessages || 0;
  const conversationCount = userStat.conversationMeta.conversationCount || 0;
  const lastConversationDateTime = userStat.conversationMeta.lastConversationDate;
  const lastConversationAgo = lastConversationDateTime
    ? dayjs(lastConversationDateTime).fromNow()
    : "Never";

  const interviewStats = userStat.interviewStats || [];
  const gameUsername = game.userNames?.[userId || ""] || "";
  const userStats = game.stats.find((s) => s.userId === userId);
  const gameAvatar = game.gameAvatars[userId || ""] || defaultAvatar;
  const nativeLanguage =
    fullEnglishLanguageName[user.nativeLanguageCode as SupportedLanguage] ||
    user.nativeLanguageCode ||
    "en";
  const languageToLearn = fullEnglishLanguageName[user.languageCode || "en"];

  const learning = `${nativeLanguage} → ${languageToLearn}`;

  const [isCopied, setIsCopied] = useState(false);
  useEffect(() => {
    if (!isCopied) {
      return;
    }
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  }, [isCopied]);

  const copy = () => {
    copyToClipboard(allTextInfo);
    setIsCopied(true);
  };

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
      <Stack
        sx={{
          width: "500px",
        }}
      >
        <Link href={firebaseLink} variant="h6" target="_blank" rel="noopener noreferrer">
          {user.email} | {displayName}
        </Link>
        <Typography variant="caption">
          <b>{lastLoginAgo}</b> - login
        </Typography>
        <Typography variant="caption">
          <b>{lastConversationAgo}</b> - conversations ({conversationCount} | {totalMessages}
          {` messages`})
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
              style={{
                borderRadius: "4px",
                width: "24px",
              }}
            />
          )}
          <Typography variant="caption">
            {[countryName, currency, learning].filter(Boolean).join(" | ")}
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
            <img src={gameAvatar} style={{ borderRadius: "34px", width: "22px", height: "22px" }} />
          )}
          <Typography variant="caption">
            {[gameUsername, userStats?.points].filter(Boolean).join(" | ")}
          </Typography>
        </Stack>
        {userStat.userData.isCreditCardConfirmed && (
          <Stack
            sx={{
              flexDirection: "row",
              alignItems: "center",
              gap: "8px",
              padding: "4px 0",
              color: "#4caf50",
            }}
          >
            <Typography variant="caption">Card verified</Typography>
            <BadgeCheck size={"16px"} />
          </Stack>
        )}

        {interviewStats.length > 0 && (
          <Stack
            sx={{
              flexDirection: "row",
              alignItems: "center",
              gap: "8px",
              padding: "4px 0",
              color: "#ff27edff",
            }}
          >
            <Typography variant="body2">Interview app</Typography>
            <Gem size={"16px"} />
          </Stack>
        )}
      </Stack>
      {allTextInfo && (
        <Stack
          sx={{
            flexDirection: "row",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Stack
            sx={{
              width: "600px",
            }}
          >
            <Typography variant="caption">Quiz</Typography>
            <TextField value={allTextInfo} rows={22} multiline />
          </Stack>
          <Button
            color={isCopied ? "success" : "primary"}
            startIcon={isCopied ? <Check size="16px" /> : <Copy size="16px" />}
            variant="outlined"
            size="small"
            onClick={() => copy()}
          >
            {isCopied ? "Copied" : "Copy quiz"}
          </Button>
          <Button onClick={() => setIsQuizFull(!isQuizFull)}>
            {isQuizFull ? "Collapse" : "Expand"}
          </Button>
        </Stack>
      )}
    </Stack>
  );
};

export function AdminStats() {
  const auth = useAuth();
  const isAdmin = DEV_EMAILS.includes(auth?.userInfo?.email || "");
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);
  const [sourceData, setData] = useState<AdminStatsResponse | null>(null);

  const data = useMemo(() => {
    if (!sourceData) return null;
    const cleanUsers = sourceData?.users.filter((user) => {
      return !user.userData.email?.includes("dmowski");
    });
    return { ...sourceData, users: cleanUsers || [] };
  }, [sourceData]);

  const loadFullData = async () => {
    isLoadingRef.current = true;
    setIsLoading(true);
    const result = await loadStatsRequest({ isFullExport: true }, await auth.getToken());
    isLoadingRef.current = false;
    setIsLoading(false);
    setData(result);
  };

  const loadStatsData = async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setIsLoading(true);
    const result = await loadStatsRequest({ isFullExport: false }, await auth.getToken());
    isLoadingRef.current = false;
    setIsLoading(false);
    setData(result);
  };

  const [isCopied, setIsCopied] = useState(false);
  useEffect(() => {
    if (!isCopied) {
      return;
    }
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  }, [isCopied]);

  const copyAll = async () => {
    const dataWithoutUserNames = data?.users
      .map((userStat) => {
        const { userData, ...rest } = userStat;
        const userDataUpdated = {
          country: userData.country,
          currency: userData.currency,
          countryName: userData.countryName,
          languageCode: userData.languageCode,
          nativeLanguageCode: userData.nativeLanguageCode,
          pageLanguageCode: userData.languageCode,
        };

        return {
          ...rest,
          userData: userDataUpdated,
          goalQuiz2: userStat.goalQuiz2.map((quiz) => {
            const updatedQuiz = {
              aboutUserTranscription: quiz.aboutUserTranscription,
              aboutUserFollowUpTranscription: quiz.aboutUserFollowUpTranscription,
              goalUserTranscription: quiz.goalUserTranscription,
            };

            return {
              ...updatedQuiz,
              goalData: undefined,
            };
          }),
        };
      })
      .filter((data) => data.goalQuiz2[0]?.aboutUserFollowUpTranscription);

    const allUsersString = JSON.stringify(dataWithoutUserNames, null, 2);
    // This is dump from my current users. Analyze them and give me insights
    await copyToClipboard(allUsersString);
    setIsCopied(true);
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
          <Stack
            sx={{
              alignItems: "flex-start",
            }}
          >
            <Typography variant="h6">Users: {data.users.length}</Typography>
            <Typography variant="h6">Today users: {todayUsers.length}</Typography>
            <Stack
              sx={{
                gap: "10px",
                flexDirection: "row",
              }}
            >
              <Button variant="contained" onClick={loadFullData}>
                Load full data
              </Button>
              <Button
                color={isCopied ? "success" : "primary"}
                startIcon={isCopied ? <Check size="16px" /> : <Copy size="16px" />}
                variant="outlined"
                size="small"
                onClick={() => copyAll()}
              >
                Copy to clipboard
              </Button>
            </Stack>
          </Stack>
          <Stack
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "36px",
              padding: "20px 10px",
            }}
          >
            {users.map((user) => (
              <UserCard
                key={user.userData.id}
                userStat={user}
                allTextInfo={JSON.stringify(user, null, 2)}
              />
            ))}
          </Stack>
        </>
      )}
    </Stack>
  );
}
