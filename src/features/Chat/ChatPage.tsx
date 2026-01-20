import { Alert, Badge, Button, Stack, Typography } from "@mui/material";
import { ChatSection } from "./ChatSection";
import { ChatProvider } from "./useChat";
import { useLingui } from "@lingui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useChatList } from "./useChatList";
import { useUrlState } from "../Url/useUrlParam";
import { useAuth } from "../Auth/useAuth";
import { useGame } from "../Game/useGame";
import { Avatar } from "../Game/Avatar";
import { uniq } from "@/libs/uniq";
import { UserChatMetadata } from "./type";
import dayjs from "dayjs";
import { UserName } from "../User/UserName";

export const ChatPage = ({
  type,
  isFullContentByDefault,
}: {
  type: "public" | "private";
  isFullContentByDefault?: boolean;
}) => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const game = useGame();

  const [activeChatId, setActiveChatId] = useUrlState<string>(
    "activeChatId",
    "",
    false,
  );
  const chatList = useChatList();

  const chatMetadata = chatList.myChats.find(
    (chat) => chat.spaceId === activeChatId,
  );

  const activeChatBgImage =
    game.gameAvatars[
      chatMetadata?.allowedUserIds?.sort((a, b) => {
        // my id last
        if (a === auth.uid) return 1;
        if (b === auth.uid) return -1;
        return 0;
      })?.[0] || ""
    ];

  return (
    <Stack>
      {type === "public" ? (
        <ChatProvider
          metadata={{
            spaceId: "global",
            allowedUserIds: null,
            isPrivate: false,
            type: "global",
          }}
        >
          <ChatSection
            contextForAiAnalysis=""
            isFullContentByDefault={isFullContentByDefault}
          />
        </ChatProvider>
      ) : (
        <>
          {activeChatId ? (
            <Stack
              sx={{
                gap: "0px",
                backgroundColor: `rgba(255, 255, 255, 0.02)`,
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "15px",
              }}
            >
              {chatMetadata ? (
                <>
                  <Stack
                    sx={{
                      padding: "60px 2px 50px 2px",
                      width: "100%",
                      gap: "20px",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    <Stack
                      sx={{
                        position: "absolute",
                        top: "0",
                        left: "0",
                        width: "100%",
                        height: "100%",
                        overflow: "hidden",
                        borderRadius: "15px 15px 0 0",
                        zIndex: -1,
                      }}
                    >
                      <Stack
                        sx={{
                          background: `url('${activeChatBgImage}') no-repeat center center`,
                          width: "calc(100% + 30px)",
                          height: "calc(100% + 20px)",
                          position: "relative",
                          top: "-15px",
                          left: "-15px",
                          backgroundPosition: "center",
                          backgroundSize: "cover",
                          opacity: 0.1,
                          filter: "blur(22px)",
                          overflow: "hidden",
                          border: "10px solid red",
                        }}
                      />
                    </Stack>

                    <Stack
                      sx={{
                        alignItems: "center",
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                      }}
                    >
                      <Button
                        color="info"
                        variant="outlined"
                        onClick={() => setActiveChatId("")}
                        startIcon={<ChevronLeft />}
                      >
                        {i18n._("Back")}
                      </Button>
                    </Stack>
                    <Stack
                      sx={{
                        alignItems: "center",
                        gap: "20px",
                      }}
                    >
                      <ChatHeaderFull chat={chatMetadata} />
                    </Stack>
                  </Stack>

                  <ChatProvider metadata={chatMetadata}>
                    <ChatSection
                      contextForAiAnalysis=""
                      isFullContentByDefault={isFullContentByDefault}
                    />
                  </ChatProvider>
                </>
              ) : (
                <Stack
                  sx={{
                    padding: "20px",
                    gap: "20px",
                    alignItems: "flex-start",
                  }}
                >
                  <Alert
                    severity="error"
                    sx={{
                      width: "100%",
                    }}
                  >
                    {i18n._("Chat not found or you don't have access to it.")}
                  </Alert>
                  <Button
                    startIcon={<ChevronLeft />}
                    onClick={() => setActiveChatId("")}
                    variant="outlined"
                  >
                    {i18n._("Back to chat list")}
                  </Button>
                </Stack>
              )}
            </Stack>
          ) : (
            <>
              {chatList.loading ? (
                <Typography>Loading...</Typography>
              ) : (
                <>
                  {chatList.myChats.length === 0 ? (
                    <Stack
                      sx={{
                        paddingTop: "10px",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          opacity: 0.7,
                        }}
                      >
                        {i18n._("You have no chats yet.")}
                      </Typography>
                    </Stack>
                  ) : (
                    <Stack
                      sx={{
                        gap: "10px",
                        padding: "15px 0 20px 0",

                        borderRadius: "12px",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        backgroundColor: "rgba(255, 255, 255, 0.03)",
                        "@media (max-width: 600px)": {
                          gap: "3px",
                          border: "none",
                          borderRadius: 0,
                          padding: "0",
                        },
                      }}
                    >
                      {chatList.myChats.map((chat, index) => {
                        const unreadCount =
                          chatList.unreadSpaces[chat.spaceId] || 0;
                        return (
                          <Stack
                            key={chat.spaceId || index}
                            component={"button"}
                            onClick={() => {
                              setActiveChatId(chat.spaceId);
                            }}
                            sx={{
                              borderRadius: "3px",
                              padding: "10px 20px 10px 12px",
                              backgroundColor: `rgba(255, 255, 255, 0.05)`,
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                              border: "none",
                              color: "inherit",
                              cursor: "pointer",
                              textAlign: "left",
                              ":hover": {
                                backgroundColor: `rgba(255, 255, 255, 0.1)`,
                              },
                              "@media (max-width: 600px)": {
                                borderRadius: 0,
                              },
                            }}
                          >
                            <Stack
                              sx={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: "10px",
                              }}
                            >
                              <ChatHeaderList chat={chat} />
                            </Stack>
                            <Stack
                              sx={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: "10px",
                              }}
                            >
                              <Badge color="error" badgeContent={unreadCount}>
                                <ChevronRight />
                              </Badge>
                            </Stack>
                          </Stack>
                        );
                      })}
                    </Stack>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </Stack>
  );
};

const ChatHeaderList = ({ chat }: { chat: UserChatMetadata }) => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const game = useGame();

  const allUserIds = uniq(
    chat.allowedUserIds?.sort((a, b) => {
      // me first
      if (a === auth.uid) return -1;
      if (b === auth.uid) return 1;
      return 0;
    }) || [],
  );

  const isOnlyOneUser = allUserIds.length <= 1;
  const userIds = allUserIds.filter(
    (userId) => isOnlyOneUser || userId !== auth.uid,
  );

  return (
    <>
      <Stack
        sx={{
          flexDirection: "row",
          minWidth: "50px",
        }}
      >
        {userIds.map((userId, index) => {
          return (
            <Stack
              key={userId}
              sx={{
                marginLeft: index === 0 ? "0" : "-30px",
              }}
            >
              <Avatar url={game.getUserAvatarUrl(userId)} avatarSize={"44px"} />
            </Stack>
          );
        })}
      </Stack>
      <Stack
        sx={{
          alignItems: "flex-start",
        }}
      >
        <Typography variant="caption">
          {chat.type === "debate" && i18n._("Debate Chat")}
          {chat.type === "dailyQuestion" && i18n._("Daily Question Chat")}
          {chat.type === "global" && i18n._("Global Chat")}
          {chat.type === "privateChat" && i18n._("Chat")}

          {!chat.type && i18n._("Chat")}
        </Typography>
        <Stack>
          {userIds.map((userId) => {
            const userName = game.getUserName(userId);
            return (
              <UserName
                size="normal"
                key={userId}
                bold
                userId={userId}
                userName={userName}
              />
            );
          })}
        </Stack>
      </Stack>
    </>
  );
};

const ChatHeaderFull = ({ chat }: { chat: UserChatMetadata }) => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const game = useGame();

  const allUserIds = uniq(
    chat.allowedUserIds?.sort((a, b) => {
      // me first
      if (a === auth.uid) return -1;
      if (b === auth.uid) return 1;
      return 0;
    }) || [],
  );

  const isOnlyOneUser = allUserIds.length <= 1;
  const userIds = allUserIds.filter(
    (userId) => isOnlyOneUser || userId !== auth.uid,
  );
  const lastVisited = dayjs(
    userIds
      .map((userId) => game.gameLastVisit?.[userId])
      .sort()
      .reverse()[0] || Date.now(),
  ).fromNow();

  return (
    <>
      <Stack
        sx={{
          flexDirection: "row",
          minWidth: "44px",
        }}
      >
        {userIds.map((userId, index) => {
          return (
            <Stack
              key={userId}
              sx={{
                marginLeft: index === 0 ? "0" : "-30px",
              }}
            >
              <Avatar
                url={game.getUserAvatarUrl(userId)}
                avatarSize={"90px"}
                onClick={() => {
                  game.showUserInModal(userId);
                }}
              />
            </Stack>
          );
        })}
      </Stack>
      <Stack
        sx={{
          alignItems: "center",
        }}
      >
        <Typography variant="caption">
          {chat.type === "debate" && i18n._("Debate Chat")}
          {chat.type === "dailyQuestion" && i18n._("Daily Question Chat")}
          {chat.type === "global" && i18n._("Global Chat")}
          {chat.type === "privateChat" && i18n._("Chat")}

          {!chat.type && i18n._("Chat")}
        </Typography>

        <Stack>
          {userIds.map((userId) => {
            const userName = game.getUserName(userId);
            return (
              <UserName
                size="large"
                key={userId}
                userId={userId}
                userName={userName}
                center
              />
            );
          })}
        </Stack>

        <Typography
          variant="caption"
          sx={{
            opacity: 0.7,
            paddingTop: "4px",
            position: "absolute",
            top: "10px",
            right: "15px",
          }}
        >
          {i18n._("Last visited: {lastVisited}", { lastVisited })}
        </Typography>
      </Stack>
    </>
  );
};
