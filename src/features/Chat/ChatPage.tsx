import { Badge, Button, ButtonGroup, Stack, Typography } from "@mui/material";
import { ChatSection } from "./ChatSection";
import { ChatProvider } from "./useChat";
import { useLingui } from "@lingui/react";
import { ChevronLeft, ChevronRight, Globe, HatGlasses } from "lucide-react";
import { useChatList } from "./useChatList";
import { useUrlState } from "../Url/useUrlParam";
import { useAuth } from "../Auth/useAuth";
import { useGame } from "../Game/useGame";
import { Avatar } from "../Game/Avatar";
import { uniq } from "@/libs/uniq";

export const ChatPage = () => {
  const { i18n } = useLingui();
  const auth = useAuth();

  const [page, setPage] = useUrlState<"public" | "private">("chats", "public", false);

  const [activeChatId, setActiveChatId] = useUrlState<string>("activeChatId", "", false);
  const chatList = useChatList();
  const game = useGame();
  const chatMetadata = chatList.myChats.find((chat) => chat.spaceId === activeChatId);

  const myUnreadCount = Object.values(chatList.unreadSpaces).reduce((a, b) => a + b, 0);

  return (
    <Stack>
      <Stack
        sx={{
          padding: "10px 2px",
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
          gap: "10px",
          "@media (max-width: 600px)": {
            border: "none",
          },
        }}
      >
        <ButtonGroup>
          <Button
            size="small"
            startIcon={<Globe size={"14px"} />}
            variant={page === "public" ? "contained" : "outlined"}
            onClick={() => setPage("public")}
          >
            {i18n._("Public")}
          </Button>
          <Badge color="error" badgeContent={myUnreadCount}>
            <Button
              startIcon={<HatGlasses size={"14px"} />}
              variant={page === "private" ? "contained" : "outlined"}
              onClick={() => setPage("private")}
            >
              {i18n._("My Chats")}
            </Button>
          </Badge>
        </ButtonGroup>
      </Stack>

      {page === "public" ? (
        <ChatProvider
          metadata={{
            spaceId: "global",
            allowedUserIds: null,
            isPrivate: false,
            type: "global",
          }}
        >
          <ChatSection />
        </ChatProvider>
      ) : (
        <>
          {activeChatId ? (
            <Stack
              sx={{
                gap: "10px",
                borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                paddingTop: "10px",
                marginTop: "10px",
              }}
            >
              <Stack
                sx={{
                  flexDirection: "row",
                }}
              >
                <Button
                  onClick={() => {
                    setActiveChatId("");
                  }}
                  startIcon={<ChevronLeft />}
                >
                  {i18n._("Back to all chats")}
                </Button>
              </Stack>
              {chatMetadata && (
                <ChatProvider metadata={chatMetadata}>
                  <ChatSection />
                </ChatProvider>
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
                        paddingTop: "20px",
                        "@media (max-width: 600px)": {
                          gap: "3px",
                        },
                      }}
                    >
                      {chatList.myChats.map((chat, index) => {
                        const unreadCount = chatList.unreadSpaces[chat.spaceId] || 0;

                        const allUserIds = uniq(
                          chat.allowedUserIds?.sort((a, b) => {
                            // me first
                            if (a === auth.uid) return -1;
                            if (b === auth.uid) return 1;
                            return 0;
                          }) || []
                        );

                        const isOnlyOneUser = allUserIds.length <= 1;

                        const userIds = allUserIds.filter(
                          (userId) => isOnlyOneUser || userId !== auth.uid
                        );

                        const userNames = userIds
                          .map((userId) => game.getUserName(userId))
                          .join(", ");

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
                                        avatarSize="40px"
                                      />
                                    </Stack>
                                  );
                                })}
                              </Stack>
                              <Stack>
                                <Typography
                                  variant="body1"
                                  sx={{
                                    fontWeight: 600,
                                  }}
                                >
                                  {chat.type === "debate" && i18n._("Debate Chat")}
                                  {chat.type === "dailyQuestion" && i18n._("Daily Question Chat")}
                                  {chat.type === "global" && i18n._("Global Chat")}
                                  {chat.type === "privateChat" && i18n._("Chat")}

                                  {!chat.type && i18n._("Chat")}
                                </Typography>
                                <Typography variant="body2">{userNames}</Typography>
                              </Stack>
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
