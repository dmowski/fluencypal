"use client";
import { Button, IconButton, Link, Stack, TextField, Tooltip, Typography } from "@mui/material";
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
  ArrowRight,
  BadgeCheck,
  Check,
  Copy,
  Crown,
  Gem,
  HandCoins,
  House,
  LogIn,
  SquareArrowOutUpRight,
  UserPlus,
} from "lucide-react";
import { defaultAvatar } from "../Game/avatars";
import { UserSource } from "@/common/analytics";
import { Messages } from "../Conversation/Messages";
import { Conversation } from "@/common/conversation";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { GoalPlan } from "../Plan/types";
import { GoalReview } from "../Goal/Quiz/GoalReview";

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

  const aiUserInfo = userStat.aiUserInfo;
  const browserInfo = userStat.userData?.browserInfo || "";
  const parsedBrowserInfo = browserInfo ? parseBrowserInfo(browserInfo) : null;

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

  const [showGoalPlan, setShowGoalPlan] = useState<GoalPlan | null>(null);

  const exampleMessageFromQuiz = userStat.goalQuiz2[0]?.exampleOfWelcomeMessage || "";

  return (
    <Stack
      sx={{
        border: isToday ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid transparent",
        borderRadius: "10px",
        padding: "14px 25px",
        flexDirection: "row",
        //alignItems: "center",
        gap: "25px",
        backgroundColor: "rgba(17, 17, 17, 0.2)",
        height: "500px",
      }}
    >
      {showGoalPlan && (
        <CustomModal onClose={() => setShowGoalPlan(null)} isOpen={true}>
          <GoalReview
            goalData={showGoalPlan}
            onClick={function (): void {
              setShowGoalPlan(null);
            }}
            isLoading={false}
          />
        </CustomModal>
      )}

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
            <Tooltip title={dayjs(user.lastLoginAtDateTime).format("DD MMMM YYYY HH:mm") || ""}>
              <Typography variant="body2">
                <LogIn className="icon" /> {lastLoginAgo} | Login
              </Typography>
            </Tooltip>

            <Tooltip title={dayjs(user.createdAtIso).format("DD MMMM YYYY HH:mm") || ""}>
              <Typography variant="body2">
                <UserPlus className="icon" /> {createdAgo} | Created
              </Typography>
            </Tooltip>
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
          href={`/practice?page=community&space=rate&userId=${userId}`}
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

        {browserInfo && (
          <Stack
            sx={{
              width: "100%",
              wordBreak: "break-all",
            }}
          >
            {parsedBrowserInfo ? (
              <Typography variant="caption">
                {parsedBrowserInfo.browserName} on {parsedBrowserInfo.os}
              </Typography>
            ) : (
              <Typography variant="caption">{browserInfo}</Typography>
            )}
          </Stack>
        )}
      </Stack>

      <Stack
        sx={{
          width: "100%",
          height: "100%",
          overflow: "auto",
          gap: "10px",
        }}
      >
        <Stack
          sx={{
            backgroundColor: "rgba(20, 79, 146, 1)",
            borderRadius: "8px",
            gap: "2px",
          }}
        >
          {userStat.goalQuiz2.map((quiz, index) => (
            <Stack
              key={index}
              sx={{
                flexDirection: "row",
                padding: "10px",
                borderRadius: "8px 8px 0 0",
                alignItems: "center",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                cursor: "pointer",
                ":hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
              }}
              onClick={() => {
                setShowGoalPlan(quiz.goalData);
              }}
            >
              <Typography variant="h6">{quiz?.goalData?.title || ""}</Typography>

              <IconButton>
                <SquareArrowOutUpRight size={"18px"} />
              </IconButton>
            </Stack>
          ))}

          <Stack
            sx={{
              gap: "20px",
              padding: "10px",
            }}
          >
            <Typography variant="body1">
              {userStat.goalQuiz2[0]?.aboutUserTranscription || ""}
            </Typography>
            <Stack>
              <Typography variant="caption" sx={{}}>
                {userStat.goalQuiz2[0]?.aboutUserFollowUpQuestion.title}
              </Typography>
              <Typography variant="body1">
                {userStat.goalQuiz2[0]?.aboutUserFollowUpTranscription || ""}
              </Typography>
            </Stack>

            <Stack>
              <Typography variant="caption">
                {userStat.goalQuiz2[0]?.goalFollowUpQuestion.title}
              </Typography>
              <Typography variant="body1">
                {userStat.goalQuiz2[0]?.goalUserTranscription || ""}
              </Typography>
            </Stack>

            {aiUserInfo?.records && (
              <details open>
                <summary>AI User Info Records ({aiUserInfo.records.length})</summary>

                <Stack sx={{ gap: "10px", paddingTop: "10px" }}>
                  {aiUserInfo?.records.map((record, index) => (
                    <Typography
                      key={index}
                      variant="body1"
                      sx={{
                        //borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                        padding: "8px",
                        borderRadius: "4px",
                        fontSize: "18px",
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                      }}
                    >
                      {record}
                    </Typography>
                  ))}
                </Stack>
              </details>
            )}
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
            return (b.updatedAtIso || "").localeCompare(a.updatedAtIso || "");
          })
          .filter((_, index) => index < 23)
          .map((conversation) => {
            return (
              <Stack
                key={conversation.id}
                sx={{
                  backgroundColor: "rgba(229, 229, 229, 0.21)",
                  padding: "10px 15px",
                  cursor: "pointer",
                  borderRadius: "8px",
                  display: "grid",
                  gridTemplateColumns: "140px 200px 200px",
                  gap: "10px",
                  ":hover": { backgroundColor: "rgba(229, 229, 229, 0.35)" },
                }}
                onClick={() => setShowConversation(conversation)}
              >
                <Typography sx={{}}>
                  <b>{conversation.messagesCount} messages</b>
                </Typography>

                <Typography sx={{}}>{conversation.mode}</Typography>

                <Typography sx={{}}>
                  {dayjs(conversation.updatedAtIso).format("DD MMM")} |{" "}
                  {dayjs(conversation.createdAtIso || conversation.createdAt).format("HH:mm")} -
                  {dayjs(conversation.updatedAtIso).format("HH:mm")}
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

  const [usersToShowMode, setUsersToShowMode] = useState<"all" | "today" | "secondDay" | "old">(
    "all",
  );

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

  const secondDayVisitors = todayUsers.filter((user) => {
    const createdAt = user.userData.createdAtIso;
    const lastLogin = user.userData.lastLoginAtDateTime;

    return (
      createdAt &&
      lastLogin &&
      dayjs(lastLogin).diff(dayjs(createdAt), "hour") >= 24 &&
      dayjs(lastLogin).diff(dayjs(createdAt), "hour") < 48
    );
  });

  const thirdAndMoreDayVisitors = todayUsers.filter((user) => {
    const createdAt = user.userData.createdAtIso;
    const lastLogin = user.userData.lastLoginAtDateTime;
    return createdAt && lastLogin && dayjs(lastLogin).diff(dayjs(createdAt), "hour") >= 48;
  });

  const todayMessagesCount = todayUsers.reduce((acc, user) => {
    const todayMessages = user.conversationMeta.todayMessages || 0;
    return acc + todayMessages;
  }, 0);

  const lastHourMessagesCount = todayUsers.reduce((acc, user) => {
    const lastHourMessages = user.conversationMeta.lastHourMessages || 0;
    return acc + lastHourMessages;
  }, 0);

  const usersToShow =
    usersToShowMode === "all"
      ? users
      : usersToShowMode === "today"
        ? todayUsers
        : usersToShowMode === "secondDay"
          ? secondDayVisitors
          : thirdAndMoreDayVisitors;

  if (!isAdmin) return <></>;
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
                  "&.active": {
                    backgroundColor: "rgba(255, 255, 255, 0.06)",
                  },
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

              <Stack
                className={["stat-card", usersToShowMode === "today" ? "active" : ""].join(" ")}
                onClick={() => setUsersToShowMode("today")}
              >
                <Typography className="value">{todayUsers.length}</Typography>
                <Typography align="center" variant="body2" className="label">
                  Today Users
                </Typography>
              </Stack>

              <Stack
                className={["stat-card", usersToShowMode === "secondDay" ? "active" : ""].join(" ")}
                onClick={() => setUsersToShowMode("secondDay")}
              >
                <Typography className="value">{secondDayVisitors.length}</Typography>
                <Typography align="center" variant="body2" className="label">
                  Second Day Visitors
                </Typography>
              </Stack>

              <Stack
                className={["stat-card", usersToShowMode === "old" ? "active" : ""].join(" ")}
                onClick={() => setUsersToShowMode("old")}
              >
                <Typography className="value">{thirdAndMoreDayVisitors.length}</Typography>
                <Typography align="center" variant="body2" className="label">
                  Old Visitors
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
            {usersToShow.map((user) => (
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

type BrowserInfo = {
  browserName: string;
  os: string;
};

export function parseBrowserInfo(userAgent?: string): BrowserInfo {
  const ua = (
    userAgent ?? (typeof navigator !== "undefined" ? navigator.userAgent : "")
  ).toLowerCase();

  // ---------- OS ----------
  let os = "Unknown OS";

  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) {
    // iOS version example: OS 18_7 like Mac OS X
    const m = ua.match(/os (\d+)[._](\d+)(?:[._](\d+))?/);
    os = m ? `iOS ${m[1]}.${m[2]}${m[3] ? "." + m[3] : ""}` : "iOS";
  } else if (ua.includes("android")) {
    const m = ua.match(/android (\d+)(?:\.(\d+))?(?:\.(\d+))?/);
    os = m ? `Android ${m[1]}${m[2] ? "." + m[2] : ""}${m[3] ? "." + m[3] : ""}` : "Android";
  } else if (ua.includes("mac os x")) {
    const m = ua.match(/mac os x (\d+)[._](\d+)(?:[._](\d+))?/);
    os = m ? `macOS ${m[1]}.${m[2]}${m[3] ? "." + m[3] : ""}` : "macOS";
  } else if (ua.includes("windows nt")) {
    const m = ua.match(/windows nt (\d+)\.(\d+)/);
    // mapping NT versions to Windows names
    if (m) {
      const nt = `${m[1]}.${m[2]}`;
      os =
        nt === "10.0"
          ? "Windows 10/11"
          : nt === "6.3"
            ? "Windows 8.1"
            : nt === "6.2"
              ? "Windows 8"
              : nt === "6.1"
                ? "Windows 7"
                : nt === "6.0"
                  ? "Windows Vista"
                  : nt === "5.1"
                    ? "Windows XP"
                    : `Windows NT ${nt}`;
    } else {
      os = "Windows";
    }
  } else if (ua.includes("linux")) {
    os = "Linux";
  }

  // ---------- Browser ----------
  let browserName = "Unknown Browser";

  // Edge (Chromium) includes "edg/"
  if (ua.includes("edg/")) {
    const m = ua.match(/edg\/([\d.]+)/);
    browserName = m ? `Edge ${m[1]}` : "Edge";
  }
  // Opera includes "opr/"
  else if (ua.includes("opr/")) {
    const m = ua.match(/opr\/([\d.]+)/);
    browserName = m ? `Opera ${m[1]}` : "Opera";
  }
  // Firefox includes "firefox/"
  else if (ua.includes("firefox/")) {
    const m = ua.match(/firefox\/([\d.]+)/);
    browserName = m ? `Firefox ${m[1]}` : "Firefox";
  }
  // Chrome on iOS uses CriOS; regular Chrome uses Chrome/
  else if (ua.includes("crios/")) {
    const m = ua.match(/crios\/([\d.]+)/);
    browserName = m ? `Chrome (iOS) ${m[1]}` : "Chrome (iOS)";
  }
  // Chrome (ignore if it's SamsungBrowser etc. if you want)
  else if (ua.includes("chrome/")) {
    const m = ua.match(/chrome\/([\d.]+)/);
    browserName = m ? `Chrome ${m[1]}` : "Chrome";
  }
  // Safari: detect by "safari" + "version/" but not chrome
  else if (ua.includes("safari") && ua.includes("version/")) {
    const m = ua.match(/version\/([\d.]+)/);
    browserName = m ? `Safari ${m[1]}` : "Safari";
  }

  return { browserName, os };
}
