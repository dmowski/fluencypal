"use client";
import { Stack, Typography } from "@mui/material";
import { useUsage } from "./useUsage";
import { BookType, Fish, MessagesSquare } from "lucide-react";
import { useWords } from "../Words/useWords";
import { JSX, useState } from "react";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { StringDiff } from "react-string-diff";
import { useChatHistory } from "../ConversationHistory/useChatHistory";
import { conversationModeLabel } from "../Conversation/data";
import { useLingui } from "@lingui/react";
import { Markdown } from "../uiKit/Markdown/Markdown";
import dayjs from "dayjs";
import { useCorrections } from "../Corrections/useCorrections";
import { useSettings } from "../Settings/useSettings";

interface StatCardProps {
  title: string;
  subTitle: string;
  value: string;
  startColor: string;
  endColor: string;
  bgColor: string;
  miniCard: JSX.Element;
  onClick: () => void;
}
const StatCard = ({
  title,
  subTitle,
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
        variant="caption"
        sx={{
          fontWeight: 300,
          opacity: 0.9,
          textTransform: "uppercase",
        }}
      >
        {subTitle}
      </Typography>

      <Typography
        align="center"
        sx={{
          fontWeight: 800,
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

interface WorkStat {
  word: string;
  percentage: number;
  usageCount: number;
}

export const UsageStatsCards = () => {
  const usage = useUsage();
  const words = useWords();
  const settings = useSettings();

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

  const chatHistory = useChatHistory();
  const { i18n } = useLingui();

  const corrections = useCorrections();
  const [isShowCorrectionStats, setIsShowCorrectionStats] = useState(false);

  const correctionStats = corrections.correctionStats.filter((stat) => {
    const statLang = stat.languageCode;
    return statLang === settings.languageCode;
  });
  const correctionsCount = correctionStats.length || 0;

  const isNoConversations = chatHistory.conversations.length == 0;

  return (
    <>
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
              <Typography variant="h4">{i18n._("Word Stats")}</Typography>
              <Typography variant="caption">
                {i18n._("Here are the words you used the most in your conversations.")}
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
              {wordsStatSorted.length === 0 && (
                <Stack
                  sx={{
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "15px",
                    opacity: 0.7,
                    height: "100%",
                  }}
                >
                  <Fish />
                  <Typography
                    variant="caption"
                    component={"div"}
                    sx={{
                      fontWeight: 350,
                    }}
                  >
                    {i18n._("No words used yet")}
                  </Typography>
                </Stack>
              )}

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
                <Typography variant="h4">{i18n._("Chat history")}</Typography>
                <Typography variant="caption">
                  {i18n._("Here are the conversations you had with FluencyPal.")}
                </Typography>
              </Stack>

              {chatHistory.conversations.length === 0 && (
                <Stack
                  sx={{
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "15px",
                    opacity: 0.7,
                    height: "100%",
                  }}
                >
                  <MessagesSquare />
                  <Typography
                    variant="caption"
                    component={"div"}
                    sx={{
                      fontWeight: 350,
                    }}
                  >
                    {i18n._("No conversations yet")}
                  </Typography>
                </Stack>
              )}

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

      {isShowCorrectionStats && (
        <>
          <CustomModal
            width="min(800px, 99vw)"
            onClose={() => setIsShowCorrectionStats(false)}
            isOpen={true}
          >
            <Stack
              sx={{
                maxHeight: "80vh",
                gap: "40px",
                width: "100%",
              }}
            >
              <Stack>
                <Typography variant="h4">{i18n._("Grammar Corrections")}</Typography>
                <Typography variant="caption">
                  {i18n._("Here are the corrections you had in your conversations.")}
                </Typography>
              </Stack>

              {correctionStats.length === 0 && (
                <Stack
                  sx={{
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "15px",
                    opacity: 0.7,
                    height: "100%",
                  }}
                >
                  <BookType />
                  <Typography
                    variant="caption"
                    component={"div"}
                    sx={{
                      fontWeight: 350,
                    }}
                  >
                    {i18n._("No corrections yet")}
                  </Typography>
                </Stack>
              )}

              <Stack sx={{ width: "100%", gap: "40px" }}>
                {correctionStats.map((correctionStat, index) => {
                  return (
                    <Stack
                      key={correctionStat.userMessage + index}
                      sx={{
                        borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
                        paddingBottom: "20px",
                        width: "100%",
                        gap: "10px",
                      }}
                    >
                      <Stack
                        sx={{
                          width: "100%",
                        }}
                      >
                        <Stack>
                          <Typography
                            variant="body2"
                            component={"div"}
                            sx={{
                              fontWeight: 400,
                              fontSize: "1.1rem",
                              paddingBottom: "3px",
                            }}
                          >
                            <StringDiff
                              oldValue={correctionStat.userMessage}
                              newValue={correctionStat.userMessage}
                            />
                          </Typography>
                        </Stack>

                        <Stack>
                          <Typography
                            variant="body2"
                            component={"div"}
                            sx={{
                              fontWeight: 400,
                              fontSize: "1.1rem",
                              paddingBottom: "3px",
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
                              oldValue={correctionStat.userMessage}
                              newValue={correctionStat.correctedMessage}
                            />
                          </Typography>
                        </Stack>
                      </Stack>

                      <Stack>
                        <Typography
                          sx={{
                            opacity: 0.7,
                          }}
                          variant="caption"
                        >
                          {i18n._("Description:")}
                        </Typography>
                        <Typography sx={{}}>{correctionStat.description}</Typography>
                      </Stack>
                    </Stack>
                  );
                })}
              </Stack>
            </Stack>
          </CustomModal>
        </>
      )}

      <Stack sx={{ width: "100%", gap: "15px" }}>
        <Typography variant="h6">
          {isNoConversations
            ? i18n._("Here’s you will see your progress")
            : i18n._("Here’s what you’ve achieved so far")}
        </Typography>
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
            title="Words"
            subTitle={settings.fullLanguageName || "English"}
            startColor="#FF6B6B"
            endColor="#FFD93D"
            bgColor="#5EEAD4"
            miniCard={
              <Stack
                sx={{
                  width: "100%",
                  gap: "5px",
                  height: "100%",
                  boxSizing: "border-box",
                  alignItems: "center",
                  justifyContent: wordsStatSorted.length === 0 ? "center" : "flex-start",
                }}
              >
                {wordsStatSorted.length === 0 && (
                  <Stack
                    sx={{
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "15px",
                      opacity: 0.7,
                      height: "100%",
                    }}
                  >
                    <Fish />
                    <Typography
                      variant="caption"
                      component={"div"}
                      sx={{
                        fontWeight: 350,
                      }}
                    >
                      {i18n._("No words used yet")}
                    </Typography>
                  </Stack>
                )}
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
            }
            onClick={() => setIsShowWordStat(!isShowWordStat)}
          />
          <StatCard
            value={`${correctionsCount}`}
            subTitle={settings.fullLanguageName || "English"}
            title={i18n._("Grammar fixes")}
            startColor="#4F46E5"
            endColor="#A78BFA"
            bgColor="#60A5FA"
            onClick={() => setIsShowCorrectionStats(!isShowCorrectionStats)}
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
          />
          <StatCard
            value={`${Math.round(usage.usedHours * 60)}`}
            title={i18n._("Minutes spoken")}
            subTitle={i18n._("Total")}
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
                  {i18n._("Open chat history")}
                </Typography>
              </Stack>
            }
            onClick={() => setIsOpenConversations(!isOpenConversations)}
          />
        </Stack>
      </Stack>
    </>
  );
};
