import { Button, Stack, Typography } from "@mui/material";
import { useUsage } from "./useUsage";
import { StarContainer } from "../Layout/StarContainer";
import {
  BookType,
  ChartNoAxesCombined,
  HandCoins,
  MessagesSquare,
  VenetianMask,
  Wallet,
} from "lucide-react";
import { useWords } from "../Words/useWords";
import PsychologyIcon from "@mui/icons-material/Psychology";
import { JSX, useState } from "react";
import { ContactList } from "../Landing/Contact/ContactList";
import { GradientCard } from "../uiKit/Card/GradientCard";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { StringDiff } from "react-string-diff";
import { useChatHistory } from "../ConversationHistory/useChatHistory";
import { conversationModeLabel } from "../Conversation/data";
import { useLingui } from "@lingui/react";
import { Markdown } from "../uiKit/Markdown/Markdown";
import dayjs from "dayjs";

interface StatCardProps {
  title: string;
  value: string;
  startColor: string;
  endColor: string;
  bgColor: string;
  miniCard: JSX.Element;
  onClick: () => void;
}
const StatCard = ({
  title,
  value,
  onClick,
  startColor,
  endColor,
  bgColor,
  miniCard,
}: StatCardProps) => {
  return (
    <Stack
      onClick={onClick}
      component={"button"}
      sx={{
        backgroundColor: "transparent",
        padding: "20px 20px 60px 20px",
        borderRadius: "16px",
        gap: "0px",
        alignItems: "flex-start",
        justifyContent: "center",
        border: "1px solid rgba(255, 255, 255, 0.04)",
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.3s ease",
        cursor: "pointer",

        ".mini-card": {
          position: "absolute",
          bottom: "0px",
          right: "20px",
          width: "200px",
          height: "140px",
          boxSizing: "border-box",
          transition: "all 0.3s ease",
          boxShadow: "0px 0px 26px rgba(0, 0, 0, 0.3)",
          backgroundColor: "#1E1E1E",
          padding: "20px",
          borderRadius: "16px 16px 0 0",
          "@media (max-width: 750px)": {
            width: "250px",
          },
          "@media (max-width: 450px)": {
            width: "150px",
          },
        },

        ":hover": {
          transform: "scale(1.02)",
          ".mini-card": {
            transform: "scale(1.01)",
            height: "160px",
          },
        },
      }}
    >
      <Typography
        align="center"
        sx={{
          fontWeight: 300,
          opacity: 0.9,
          textTransform: "uppercase",
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          fontWeight: 900,
          fontSize: "4rem",
        }}
      >
        {value}
      </Typography>

      <Stack className="mini-card">{miniCard}</Stack>

      <Stack
        sx={{
          backgroundColor: startColor,
          width: "320px",
          height: "120px",
          borderRadius: "40px",
          filter: "blur(50px)",

          position: "absolute",
          top: "-40px",
          left: "-20px",
          zIndex: -1,
          opacity: 0.9,
        }}
      ></Stack>

      <Stack
        sx={{
          backgroundColor: endColor,
          width: "320px",
          height: "120px",
          borderRadius: "40px",
          filter: "blur(80px)",

          position: "absolute",
          bottom: "-40px",
          right: "-20px",
          zIndex: -1,
          opacity: 0.9,
        }}
      ></Stack>

      <Stack
        sx={{
          backgroundColor: bgColor,
          width: "100%",
          height: "100%",

          position: "absolute",
          bottom: "0px",
          left: "0px",
          zIndex: -2,
          opacity: 0.1,
        }}
      ></Stack>
    </Stack>
  );
};

const WinCard = ({ title, icon }: { title: string; icon: JSX.Element }) => {
  return (
    <Stack
      sx={{
        backgroundColor: "rgba(30, 30, 30, 0.6)",
        padding: "40px 20px",
        borderRadius: "10px",
        gap: "15px",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid rgba(255, 255, 255, 0.04)",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Stack>{icon}</Stack>
      <Typography
        align="center"
        sx={{
          fontWeight: 300,
          opacity: 0.9,
        }}
      >
        {title}
      </Typography>
    </Stack>
  );
};

interface WorkStat {
  word: string;
  percentage: number;
  usageCount: number;
}

export const NoBalanceBlock = () => {
  const usage = useUsage();
  const words = useWords();
  const totalWordsCount = words.totalWordsCount;

  const [isShowWordStat, setIsShowWordStat] = useState(false);
  const [isOpenConversations, setIsOpenConversations] = useState(false);

  const dictionary = words.wordsStats?.dictionary || {};

  const wordsToShow = Object.keys(dictionary).filter((word) => {
    return word.length > 3;
  });

  const totalWordsUsage = wordsToShow.reduce((acc, word) => {
    const wordUsage = dictionary[word];
    return acc + (wordUsage || 0);
  }, 0);

  const wordsStatSorted: WorkStat[] = wordsToShow
    .map((word) => {
      const wordUsage = dictionary[word];
      return {
        word: word,
        percentage: Math.round((wordUsage / totalWordsUsage) * 100),
        usageCount: wordUsage,
      };
    })
    .sort((a, b) => b.percentage - a.percentage);

  const wordsStatUiComponent = (
    <Stack
      sx={{
        width: "100%",
        gap: "5px",
        boxSizing: "border-box",
      }}
    >
      {wordsStatSorted.map(({ word, percentage, usageCount }) => {
        return (
          <Stack
            key={word}
            sx={{
              flexDirection: "row",
              width: "100%",
              position: "relative",
              padding: "3px 5px",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                textTransform: "capitalize",
              }}
            >
              {word}
            </Typography>
            <Typography variant="caption">{usageCount}</Typography>
            <Stack
              sx={{
                height: "100%",
                width: `${percentage}%`,
                position: "absolute",
                top: "0px",
                left: "0px",
                borderRadius: "3px",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              }}
            />
          </Stack>
        );
      })}
    </Stack>
  );

  const chatHistory = useChatHistory();
  const { i18n } = useLingui();

  return (
    <Stack
      sx={{
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#121215",
        gap: "40px",
        //borderTop: "1px solid rgba(255, 255, 255, 0.11)",
        padding: "130px 0px",
        boxSizing: "border-box",
      }}
    >
      {isShowWordStat && (
        <CustomModal
          width="min(450px, 99vw)"
          onClose={() => setIsShowWordStat(false)}
          isOpen={true}
        >
          <Stack
            sx={{
              maxHeight: "80vh",
              gap: "20px",
            }}
          >
            <Stack>
              <Typography variant="h4">Word Stats</Typography>
              <Typography variant="caption">
                Here are the words you used the most in your conversations.
              </Typography>
            </Stack>
            <Stack
              sx={{
                width: "100%",
                gap: "15px",
                boxSizing: "border-box",
                padding: "20px 0",
              }}
            >
              {wordsStatSorted.map(({ word, percentage, usageCount }) => {
                return (
                  <Stack
                    key={word}
                    sx={{
                      flexDirection: "row",
                      width: "100%",
                      position: "relative",
                      padding: "7px 15px",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderRadius: "4px",
                      backgroundColor: "rgba(255, 255, 255, 0.01)",
                    }}
                  >
                    <Typography
                      sx={{
                        textTransform: "capitalize",
                        fontSize: "1.2rem",
                        fontWeight: 300,
                      }}
                    >
                      {word}
                    </Typography>
                    <Typography>{usageCount}</Typography>
                    <Stack
                      sx={{
                        height: "100%",
                        width: `${percentage}%`,
                        position: "absolute",
                        top: "0px",
                        left: "0px",
                        borderRadius: "4px",
                        backgroundColor: "rgba(200, 200, 250, 0.07)",
                      }}
                    />
                  </Stack>
                );
              })}
            </Stack>
          </Stack>
        </CustomModal>
      )}

      {isOpenConversations && (
        <>
          <CustomModal
            width="min(800px, 99vw)"
            onClose={() => setIsOpenConversations(false)}
            isOpen={true}
          >
            <Stack
              sx={{
                maxHeight: "80vh",
                gap: "40px",
              }}
            >
              <Stack>
                <Typography variant="h4">Chat history</Typography>
                <Typography variant="caption">
                  Here are the conversations you had with FluencyPal.
                </Typography>
              </Stack>

              <Stack gap="40px">
                {chatHistory.conversations.map((conversation) => {
                  return (
                    <Stack
                      key={conversation.id}
                      gap={"20px"}
                      sx={{
                        borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
                        paddingBottom: "20px",
                      }}
                    >
                      <Stack>
                        <Typography variant="h5">
                          {conversationModeLabel[conversation.mode]}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            opacity: 0.7,
                          }}
                        >
                          {dayjs(conversation.createdAt).format("DD/MM/YYYY")}
                        </Typography>
                      </Stack>

                      {conversation.messages.map((message) => {
                        const isBot = message.isBot;
                        return (
                          <Stack
                            key={message.id}
                            sx={{
                              padding: "0 0px",
                              boxSizing: "border-box",
                              color: "#e1e1e1",
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                opacity: 0.5,
                              }}
                            >
                              {isBot ? i18n._("Teacher:") : i18n._("You:")}
                            </Typography>
                            <Markdown size="small">{message.text || ""}</Markdown>
                          </Stack>
                        );
                      })}
                    </Stack>
                  );
                })}
              </Stack>
            </Stack>
          </CustomModal>
        </>
      )}
      <Stack
        sx={{
          padding: "20px 20px 20px 30px",
          gap: "60px",
          maxWidth: "1400px",
          width: "100%",
          boxSizing: "border-box",
          position: "relative",
          zIndex: 1,
          "@media (max-width: 600px)": {
            padding: "20px 15px",
          },
        }}
      >
        <Stack sx={{ width: "100%" }}>
          <Typography
            variant="h2"
            className="decor-text"
            sx={{
              "@media (max-width: 600px)": {
                fontSize: "1.9rem",
              },
            }}
          >
            Level up your Language!
          </Typography>
          <Typography
            sx={{
              opacity: 0.9,
              "@media (max-width: 600px)": {
                fontSize: "0.9rem",
                opacity: 0.8,
              },
            }}
          >
            You've made amazing progress. Let’s keep going.
          </Typography>
        </Stack>
        <Stack sx={{ width: "100%", gap: "15px" }}>
          <Typography variant="h6">Here’s what you’ve achieved so far</Typography>
          <Stack
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "20px",
              "@media (max-width: 1100px)": {
                gridTemplateColumns: "1fr 1fr",
              },

              "@media (max-width: 750px)": {
                gridTemplateColumns: "1fr",
              },
            }}
          >
            <StatCard
              value={`${totalWordsCount}`}
              title="Unique words used"
              startColor="#FF6B6B"
              endColor="#FFD93D"
              bgColor="#5EEAD4"
              miniCard={wordsStatUiComponent}
              onClick={() => setIsShowWordStat(!isShowWordStat)}
            />
            <StatCard
              value={"42"}
              title="Grammar fixes"
              startColor="#4F46E5"
              endColor="#A78BFA"
              bgColor="#60A5FA"
              miniCard={
                <Stack
                  sx={{
                    alignItems: "center",
                    height: "100%",
                    gap: "15px",
                    justifyContent: "center",
                  }}
                >
                  <BookType size={"28px"} />

                  <Typography
                    variant="body2"
                    component={"div"}
                    sx={{
                      fontWeight: 350,
                      paddingLeft: "10px",
                    }}
                  >
                    <StringDiff
                      styles={{
                        added: {
                          color: "#81e381",
                          fontWeight: 600,
                        },
                        removed: {
                          display: "none",
                          textDecoration: "line-through",
                          opacity: 0.4,
                        },
                        default: {},
                      }}
                      oldValue={"Open details"}
                      newValue={"Open the details"}
                    />
                  </Typography>
                </Stack>
              }
              onClick={() => setIsShowWordStat(!isShowWordStat)}
            />
            <StatCard
              value={`${Math.round(usage.usedHours * 60)}`}
              title="Minutes spoken"
              startColor="#34D399"
              endColor="#3B82F6"
              bgColor="#A3E635"
              miniCard={
                <Stack
                  sx={{
                    alignItems: "center",
                    height: "100%",
                    gap: "15px",
                    justifyContent: "center",
                  }}
                >
                  <MessagesSquare size={"28px"} />

                  <Typography
                    variant="body2"
                    component={"div"}
                    sx={{
                      fontWeight: 350,
                      paddingLeft: "10px",
                    }}
                  >
                    Open chat history
                  </Typography>
                </Stack>
              }
              onClick={() => setIsOpenConversations(!isOpenConversations)}
            />
          </Stack>
        </Stack>

        <Stack sx={{ width: "100%", gap: "15px" }}>
          <Typography variant="h6">Unlock full access to FluencyPal</Typography>
          <Stack
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "20px",
              "@media (max-width: 600px)": {
                gridTemplateColumns: "1fr",
              },
            }}
          >
            <WinCard
              icon={
                <PsychologyIcon
                  sx={{
                    fontSize: "50px",
                  }}
                />
              }
              title="Conversations with AI"
            />
            <WinCard icon={<VenetianMask size={50} />} title="Role-play simulations" />
            <WinCard
              icon={<ChartNoAxesCombined size={50} />}
              title="Daily tasks and progress tracking"
            />
          </Stack>
        </Stack>

        <Stack sx={{ width: "100%", gap: "15px", alignItems: "flex-start" }}>
          <Typography variant="h6">Ready to keep going?</Typography>
          <Button
            variant="contained"
            size="large"
            color="info"
            onClick={() => usage.togglePaymentModal(true)}
            startIcon={<Wallet />}
          >
            Buy More AI Hours
          </Button>
        </Stack>

        <Stack sx={{ width: "100%", gap: "15px", alignItems: "flex-start" }}>
          <Typography variant="h6">Get free AI time by helping us improve FluencyPal</Typography>
          <Stack gap={"20px"}>
            <Typography variant="body2">
              Send us your feedback about the app — what you liked, what we can improve — and get up
              to 2 hours of free AI time.
            </Typography>

            <ContactList />
          </Stack>
        </Stack>
      </Stack>

      <Stack
        sx={{
          position: "absolute",
          top: "0px",
          right: "0",
          backgroundColor: "blue",
          height: "300px",
          width: "300px",
          borderRadius: "50%",
          filter: "blur(200px)",
          zIndex: 0,
          opacity: 0.9,
        }}
      ></Stack>

      <Stack
        sx={{
          position: "absolute",
          top: "300px",
          right: "0",
          backgroundColor: "red",
          height: "300px",
          width: "300px",
          borderRadius: "50%",
          filter: "blur(200px)",
          zIndex: 0,
          opacity: 0.4,
        }}
      ></Stack>

      <Stack
        sx={{
          position: "absolute",
          top: "0px",
          left: "300px",
          backgroundColor: "cyan",
          height: "200px",
          width: "300px",
          borderRadius: "50%",
          filter: "blur(200px)",
          zIndex: 0,
          opacity: 0.61,
          "@media (max-width: 600px)": {
            left: "0px",
          },
        }}
      ></Stack>

      <Stack
        sx={{
          position: "absolute",
          top: "900px",
          left: "0",
          backgroundColor: "#5533ff",
          height: "300px",
          width: "300px",
          borderRadius: "50%",
          filter: "blur(300px)",
          zIndex: 0,
          opacity: 0.4,
        }}
      ></Stack>
    </Stack>
  );
};
