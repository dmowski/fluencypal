"use client";
import { Stack, Typography } from "@mui/material";
import { useUsage } from "./useUsage";
import { BicepsFlexed, BookType, Fish, MessagesSquare, Sprout } from "lucide-react";
import { useWords } from "../Words/useWords";
import { useState } from "react";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { StringDiff } from "react-string-diff";
import { useChatHistory } from "../ConversationHistory/useChatHistory";

import { useLingui } from "@lingui/react";
import { Markdown } from "../uiKit/Markdown/Markdown";
import dayjs from "dayjs";
import { useCorrections } from "../Corrections/useCorrections";
import { useSettings } from "../Settings/useSettings";
import { GradientBgCard } from "../uiKit/Card/GradientBgCard";
import { ConversationType } from "@/common/conversation";

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

  const chatMessages = chatHistory.conversations;

  const conversationModeLabel: Record<ConversationType, string> = {
    talk: i18n._("Just talk"),

    words: i18n._("Words"),
    rule: i18n._("Rule"),

    "role-play": i18n._("Role Play"),
    "goal-role-play": i18n._("Goal Role Play"),
    "goal-talk": i18n._("Goal Talk"),
  };

  return (
    <>
      {isShowWordStat && (
        <CustomModal onClose={() => setIsShowWordStat(false)} isOpen={true}>
          <Stack
            sx={{
              maxHeight: "80vh",
              gap: "20px",
              width: "100%",
            }}
          >
            <Stack>
              <Typography variant="h5" component={"h2"}>
                {i18n._("Word Stats")}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.7,
                }}
              >
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
                      boxSizing: "border-box",
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
          <CustomModal onClose={() => setIsOpenConversations(false)} isOpen={true}>
            <Stack
              sx={{
                gap: "40px",
                width: "100%",
              }}
            >
              <Stack>
                <Typography variant="h5" component={"h2"}>
                  {i18n._("Chat history")}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                  }}
                >
                  {i18n._("Here are the conversations you had with FluencyPal.")}
                </Typography>
              </Stack>

              {chatMessages.length === 0 && (
                <Stack
                  sx={{
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "15px",
                    opacity: 0.7,
                    height: "100%",
                    width: "100%",
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
                {chatMessages.map((conversation) => {
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
                            <Markdown variant="small">{message.text || ""}</Markdown>
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
          <CustomModal onClose={() => setIsShowCorrectionStats(false)} isOpen={true}>
            <Stack
              sx={{
                gap: "40px",
                width: "100%",
              }}
            >
              <Stack>
                <Typography variant="h5" component={"h2"}>
                  {i18n._("Grammar Corrections")}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                  }}
                >
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

      <Stack sx={{ width: "100%", gap: "25px" }}>
        <Stack
          sx={{
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
            paddingTop: "40px",
          }}
        >
          <Stack
            sx={{
              borderRadius: "50%",
              background: "linear-gradient(45deg,rgb(15, 92, 51) 0%,rgb(149, 222, 179) 100%)",
              height: "60px",
              width: "60px",

              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Sprout size={"27px"} />
          </Stack>
          <Typography variant="h6">{i18n._("Your achievements")}</Typography>
        </Stack>

        <Stack
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "20px",
          }}
        >
          <GradientBgCard
            value={`${totalWordsCount}`}
            title={i18n._("Words")}
            subTitle={settings.fullLanguageName || "English"}
            startColor="#4f1616"
            endColor="#ff9494"
            bgColor="#FF6B6B"
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
                    </Stack>
                  );
                })}
              </Stack>
            }
            onClick={() => setIsShowWordStat(!isShowWordStat)}
          />
          <GradientBgCard
            value={`${correctionsCount}`}
            subTitle={settings.fullLanguageName || "English"}
            title={i18n._("Corrections")}
            startColor="#1a1754"
            endColor="#4F46E5"
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
          <GradientBgCard
            value={`${Math.round(usage.usedHours * 60)}`}
            title={i18n._("Minutes")}
            subTitle={i18n._("Total")}
            startColor="#134a36"
            endColor="#34D399"
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
                  {i18n._("Open history")}
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
