"use client";
import { Button, Link, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { useAuth } from "../Auth/useAuth";
import { DEV_EMAILS } from "@/common/dev";
import { useEffect, useMemo, useRef, useState } from "react";
import { loadStatsRequest } from "@/app/api/loadStats/loadStatsRequest";
import { AdminStatsResponse, UserStat } from "@/app/api/loadStats/types";
import dayjs from "dayjs";
import { getFirebaseLink } from "../Firebase/getFirebaseLink";
import { useGame } from "../Game/useGame";
import { fullEnglishLanguageName, SupportedLanguage } from "../Lang/lang";
import {
  BadgeCheck,
  Check,
  Copy,
  Crown,
  Gem,
  HandCoins,
  House,
  LogIn,
  UserPlus,
} from "lucide-react";
import { defaultAvatar } from "../Game/avatars";
import { UserSource } from "@/common/analytics";
import { Messages } from "../Conversation/Messages";
import { Conversation } from "@/common/conversation";
import { CustomModal } from "../uiKit/Modal/CustomModal";

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

  const createdAgo = user.createdAtIso ? dayjs(user.createdAtIso).fromNow() : "Unknown";

  const isToday =
    user.lastLoginAtDateTime && dayjs().diff(dayjs(user.lastLoginAtDateTime), "hour") < 24;

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

  const pageLanguageCode = user.pageLanguageCode || "en";

  const userSource: UserSource | null = userStat.userData.userSource || null;
  const isFromChatGpt =
    userSource?.referrer?.toLowerCase().includes("chatgpt") ||
    userSource?.utmSource?.toLowerCase().includes("chatgpt");

  const interviewStats = userStat.interviewStats || [];
  const gameUsername = game.userNames?.[userId || ""] || "";
  const userStats = game.stats.find((s) => s.userId === userId);
  const gameAvatar = game.gameAvatars[userId || ""] || defaultAvatar;
  const nativeLanguage =
    fullEnglishLanguageName[user.nativeLanguageCode as SupportedLanguage] ||
    user.nativeLanguageCode ||
    "en";
  const languageToLearn = fullEnglishLanguageName[user.languageCode || "en"];

  const lastHourMessages = userStat.conversationMeta.lastHourMessages || 0;

  const learning = `${nativeLanguage} → ${languageToLearn}`;
  const todaysConversationsMessages = userStat.conversationMeta.todayMessages || 0;

  const isGameWinner = userStat.isGameWinner;
  const activeSubscriptionTill = userStat.activeSubscriptionTill;
  const isActiveSubscriber =
    activeSubscriptionTill && dayjs(activeSubscriptionTill).isAfter(dayjs());

  const [isCopied, setIsCopied] = useState(false);

  const conversations = userStat.conversationMeta.conversations || [];

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

  const [showConversation, setShowConversation] = useState<Conversation | null>(null);

  return (
    <Stack
      sx={{
        border: isToday ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid transparent",
        borderRadius: "10px",
        padding: "14px 25px",
        flexDirection: "row",
        //alignItems: "center",
        gap: "25px",
      }}
    >
      {showConversation && (
        <CustomModal onClose={() => setShowConversation(null)} isOpen={true}>
          <Messages
            messageOrder={showConversation.messageOrder}
            conversation={showConversation.messages}
          />
        </CustomModal>
      )}

      <Stack
        sx={{
          alignItems: "center",
          gap: "10px",
        }}
      >
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

        {isFromChatGpt && (
          <Stack
            sx={{
              flexDirection: "row",
              alignItems: "center",
              gap: "8px",
              padding: "4px 0",
              color: "#1da1f2",
            }}
          >
            <Stack
              component={"img"}
              sx={{
                width: "50px",
                height: "50px",
              }}
              src="https://us1.discourse-cdn.com/openai1/original/4X/3/2/1/321a1ba297482d3d4060d114860de1aa5610f8a9.png"
            />
          </Stack>
        )}

        {isGameWinner && (
          <Stack
            sx={{
              flexDirection: "row",
              alignItems: "center",
              gap: "8px",
              padding: "4px 0",
              background: "linear-gradient(120deg, #fda085, #8f361eff)",
              color: "#fff",
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              justifyContent: "center",
            }}
          >
            <Crown size={"25px"} />
          </Stack>
        )}

        {isActiveSubscriber && (
          <Tooltip
            title={`Subscriber till: ${dayjs(activeSubscriptionTill).format("DD MMMM h")}` + "h"}
          >
            <Stack
              sx={{
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Stack
                sx={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "8px",
                  padding: "4px 0",
                  background: "linear-gradient(120deg, #ff6ec4, #1f1aa9ff)",
                  color: "#fff",
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  justifyContent: "center",
                }}
              >
                <HandCoins size={"25px"} />
              </Stack>
              <Typography variant="caption" align="center">
                {dayjs(activeSubscriptionTill).format("DD MMM")}
              </Typography>
            </Stack>
          </Tooltip>
        )}
      </Stack>
      <Stack
        sx={{
          width: "600px",
          gap: "10px",
          ".icon": {
            width: "16px",
            height: "16px",
            verticalAlign: "middle",
            marginLeft: "4px",
          },
        }}
      >
        <Stack sx={{}}>
          <Link href={firebaseLink} variant="h6" target="_blank" rel="noopener noreferrer">
            {user.email} | {displayName}
          </Link>
          <Stack>
            <Typography variant="body2">
              <LogIn className="icon" /> {lastLoginAgo} | Login
            </Typography>

            <Typography variant="body2">
              <UserPlus className="icon" /> {createdAgo} | Created
            </Typography>
          </Stack>
        </Stack>
        <Stack
          sx={{
            padding: "20px 0",
            gap: "12px",

            b: {
              paddingRight: "12px",
              width: "40px",
              display: "inline-block",
              textAlign: "right",
            },
            ".stat-card": {
              border: "1px solid rgba(255, 255, 255, 0.1)",
              alignItems: "center",
              gap: "0px",
              width: "140px",
              padding: "17px 12px 8px 12px",
              borderRadius: "8px",
              height: "120px",
              ".value": {
                fontSize: "30px",
                fontWeight: 600,
              },
              ".label": {
                opacity: 0.9,
              },
            },
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Stack
            className="stat-card"
            sx={{
              backgroundColor: lastHourMessages > 0 ? "rgba(255, 255, 255, 0.06)" : "transparent",
            }}
          >
            <Typography className="value">{lastHourMessages}</Typography>
            <Typography align="center" variant="body2" className="label">
              Last Hour
            </Typography>
          </Stack>

          <Stack
            className="stat-card"
            sx={{
              backgroundColor:
                todaysConversationsMessages > 0 ? "rgba(255, 255, 255, 0.06)" : "transparent",
            }}
          >
            <Typography className="value">{todaysConversationsMessages}</Typography>
            <Typography align="center" variant="body2" className="label">
              Today
            </Typography>
          </Stack>

          <Stack className="stat-card">
            <Typography className="value">{totalMessages}</Typography>
            <Typography align="center" variant="body2" className="label">
              All
            </Typography>
          </Stack>

          <Stack className="stat-card">
            <Typography className="value">{conversationCount}</Typography>
            <Stack>
              <Typography align="center" variant="body2" className="label">
                Conversations
              </Typography>
              <Typography align="center" variant="caption" sx={{ opacity: 0.7 }}>
                {lastConversationAgo}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
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
            {["P:" + pageLanguageCode, countryName, currency, learning].filter(Boolean).join(" | ")}
          </Typography>
        </Stack>

        <Stack
          sx={{
            flexDirection: "row",
            alignItems: "center",
            gap: "8px",
            padding: "4px 0",
            color: "#fff",
            textDecoration: "none",
          }}
          component={"a"}
          target="_blank"
          href={`/practice?page=community&space=global-rate&userId=${userId}`}
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

        {userSource?.urlPath && (
          <Stack
            sx={{
              width: "100%",
              wordBreak: "break-all",
            }}
          >
            <Typography variant="caption">{userSource?.urlPath || ""}</Typography>
          </Stack>
        )}
      </Stack>

      <Stack
        sx={{
          width: "100%",
          height: "100%",
          maxHeight: "350px",
          overflow: "auto",
          gap: "20px",
        }}
      >
        <Stack
          sx={{
            padding: "10px",
            backgroundColor: "rgba(20, 79, 146, 1)",
            borderRadius: "8px",
          }}
        >
          <Typography variant="h6">{userStat.goalQuiz2[0]?.goalData?.title || ""}</Typography>
          <Stack
            sx={{
              gap: "10px",
            }}
          >
            <Typography variant="body1">
              {userStat.goalQuiz2[0]?.aboutUserTranscription || ""}
            </Typography>
            <Typography variant="body1">
              {userStat.goalQuiz2[0]?.aboutUserFollowUpTranscription || ""}
            </Typography>

            <Typography variant="body1">
              {userStat.goalQuiz2[0]?.goalUserTranscription || ""}
            </Typography>
          </Stack>
        </Stack>

        {conversations.length === 0 && (
          <Typography
            sx={{
              opacity: 0.6,
            }}
          >
            No conversations
          </Typography>
        )}
        {conversations
          .sort((a, b) => {
            return dayjs(b.updatedAtIso).diff(dayjs(a.updatedAtIso));
          })
          .filter((_, index) => index < 23)
          .map((conversation, index) => {
            return (
              <Stack
                key={conversation.id}
                sx={{
                  flexDirection: "row",
                  backgroundColor: "rgba(229, 229, 229, 0.21)",
                  padding: "10px",
                  cursor: "pointer",
                  borderRadius: "8px",
                  justifyContent: "space-between",
                }}
                onClick={() => setShowConversation(conversation)}
              >
                <Typography sx={{}}>
                  <b>{conversation.messagesCount} messages</b> | {conversation.mode}
                </Typography>

                <Typography sx={{}}>
                  {dayjs(conversation.updatedAtIso).format("HH:mm")} |{" "}
                  {dayjs(conversation.updatedAtIso).fromNow()}
                </Typography>
              </Stack>
            );
          })}
      </Stack>

      {allTextInfo && !!false && (
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
            <TextField value={allTextInfo} rows={13} multiline />
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
    return lastLogin && dayjs().diff(dayjs(lastLogin), "hour") < 24;
  });

  const todayMessagesCount = users.reduce((acc, user) => {
    const todayMessages = user.conversationMeta.todayMessages || 0;
    return acc + todayMessages;
  }, 0);

  const lastHourMessagesCount = users.reduce((acc, user) => {
    const lastHourMessages = user.conversationMeta.lastHourMessages || 0;
    return acc + lastHourMessages;
  }, 0);

  if (!isAdmin) {
    return <></>;
  }

  return (
    <Stack sx={{}}>
      <Button
        href="/practice"
        sx={{
          width: "max-content",
          padding: "10px 50px",
          margin: "20px 0",
          borderRadius: "210px",
        }}
        variant="contained"
        startIcon={<House />}
      >
        Home
      </Button>
      {isLoading && <Typography>Loading...</Typography>}
      {data && (
        <>
          <Stack
            sx={{
              alignItems: "flex-start",
            }}
          >
            <Stack
              sx={{
                width: "100%",
                padding: "20px",
                gap: "12px",
                flexDirection: "row",
                alignItems: "center",
                ".stat-card": {
                  width: "200px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  alignItems: "center",
                  gap: "0px",
                  padding: "17px 12px 8px 12px",
                  borderRadius: "8px",
                  height: "120px",
                  ".value": {
                    fontSize: "30px",
                    fontWeight: 600,
                  },
                  ".label": {
                    opacity: 0.9,
                  },
                },
              }}
            >
              <Stack className="stat-card">
                <Typography className="value">{todayMessagesCount}</Typography>
                <Typography align="center" variant="body2" className="label">
                  Today Messages
                </Typography>
              </Stack>

              <Stack className="stat-card">
                <Typography className="value">{lastHourMessagesCount}</Typography>
                <Typography align="center" variant="body2" className="label">
                  Last Hour Messages
                </Typography>
              </Stack>

              <Stack className="stat-card">
                <Typography className="value">{todayUsers.length}</Typography>
                <Typography align="center" variant="body2" className="label">
                  Today Users
                </Typography>
              </Stack>
            </Stack>

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
