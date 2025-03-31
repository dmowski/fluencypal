"use client";

import { useAiConversation } from "@/features/Conversation/useAiConversation";
import { Markdown } from "../uiKit/Markdown/Markdown";
import { useEffect, useState } from "react";
import { TalkingWaves } from "../uiKit/Animations/TalkingWaves";
import { Textarea } from "../uiKit/Input/Textarea";
import { Button, IconButton, Stack, Typography } from "@mui/material";
import { SendHorizontal, Wand, X } from "lucide-react";
import DoneIcon from "@mui/icons-material/Done";
import { MicroButton } from "../uiKit/Button/MicroButton";
import { KeyboardButton } from "../uiKit/Button/KeyboardButton";
import { UserMessage } from "./UserMessage";
import AddCardIcon from "@mui/icons-material/AddCard";
import { HelpButton } from "../uiKit/Button/HelpButton";
import { TextAiRequest, useTextAi } from "../Ai/useTextAi";
import { MODELS } from "@/common/ai";
import { useSettings } from "../Settings/useSettings";
import { AudioPlayIcon } from "../Audio/AudioPlayIcon";
import { useUsage } from "../Usage/useUsage";
import { AliasGamePanel } from "./AliasGamePanel";
import { VolumeButton } from "../uiKit/Button/VolumeButton";
import { convertHoursToHumanFormat } from "@/libs/convertHoursToHumanFormat";
import { ChatMessage } from "@/common/conversation";
import { GuessGameStat } from "./types";

const loadingHelpMessage = `Generating help message...`;

interface ConversationCanvasProps {
  conversation: ChatMessage[];
  isAiSpeaking: boolean;
  gameWords: GuessGameStat | null;
  isShowUserInput: boolean;
  setIsShowUserInput: (isShowUserInput: boolean) => void;
  isMuted: boolean;
  isVolumeOn: boolean;
  toggleVolume: (isVolumeOn: boolean) => void;
  isClosed: boolean;
  isClosing: boolean;
  isSavingHomework: boolean;
  isUserSpeaking: boolean;
  toggleMute: (isMuted: boolean) => void;
  finishLesson: () => Promise<void>;
  doneConversation: () => Promise<void>;
  addUserMessage: (message: string) => Promise<void>;
  fullLanguageName: string;
  generateText: (conversationDate: TextAiRequest) => Promise<string>;
  balanceHours: number;
  togglePaymentModal: (isOpen: boolean) => void;
}
export const ConversationCanvas: React.FC<ConversationCanvasProps> = ({
  conversation,
  isAiSpeaking,
  gameWords,
  isShowUserInput,
  setIsShowUserInput,
  isMuted,
  isVolumeOn,
  toggleVolume,
  isClosed,
  isClosing,
  isSavingHomework,
  isUserSpeaking,
  toggleMute,
  finishLesson,
  doneConversation,
  addUserMessage,
  fullLanguageName,
  generateText,
  balanceHours,
  togglePaymentModal,
}) => {
  const [userMessage, setUserMessage] = useState("");
  const [helpMessage, setHelpMessage] = useState("");

  const isSmallBalance = balanceHours < 0.1;
  const isExtremelySmallBalance = balanceHours < 0.05;

  const isNeedToShowBalanceWarning =
    (isSmallBalance && conversation.length > 1) || isExtremelySmallBalance;

  const submitMessage = () => {
    if (!userMessage) return;
    addUserMessage(userMessage);
    setUserMessage("");
  };

  const lastUserMessage = conversation
    .filter((message) => !message.isBot)
    .find((_, index, arr) => index >= arr.length - 1);

  const lastBotMessage = conversation
    .filter((message) => message.isBot)
    .find((_, index, arr) => index >= arr.length - 1);

  useEffect(() => {
    if (helpMessage && helpMessage !== loadingHelpMessage) {
      setHelpMessage("");
    }
  }, [lastUserMessage?.text]);

  const generateHelpMessage = async () => {
    setHelpMessage(loadingHelpMessage);
    const last4Messages = conversation.slice(-4);

    const systemInstructions = `You are grammar, language learning helper system.
User wants to create his message.
Last part of conversations: ${JSON.stringify(last4Messages)}.
Generate one simple short sentences. 5-10 words maximum.
Use ${fullLanguageName || "English"} language.
`;
    const aiResult = await generateText({
      systemMessage: systemInstructions,
      userMessage: lastBotMessage?.text || "",
      model: MODELS.gpt_4o,
    });

    console.log("Help message result", aiResult);
    setHelpMessage(aiResult || "Error");
  };

  return (
    <Stack sx={{ gap: "40px" }}>
      <TalkingWaves inActive={isAiSpeaking} />
      <Stack
        sx={{
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "10px",
          width: "100%",
          minHeight: "calc(100vh - 0px)",
          maxHeight: "2000px",
          padding: "90px 0 40px 0",
          boxSizing: "border-box",
        }}
      >
        <Stack
          sx={{
            minHeight: "300px",
            alignItems: "center",
            justifyContent: "flex-end",
            maxWidth: "1200px",
            width: "100%",
            padding: "10px",
            boxSizing: "border-box",
          }}
        >
          <Stack
            sx={{
              width: "650px",
              maxWidth: "calc(100vw - 33px)",
              gap: "20px",
            }}
          >
            {gameWords?.wordsUserToDescribe && (
              <AliasGamePanel gameWords={gameWords} conversation={conversation} />
            )}

            {lastUserMessage && <UserMessage message={lastUserMessage?.text} />}

            {lastBotMessage && (
              <Stack>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.5,
                  }}
                >
                  Teacher:
                </Typography>
                <Markdown>{lastBotMessage.text || ""}</Markdown>
              </Stack>
            )}
          </Stack>
        </Stack>

        <Stack
          sx={{
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            flexDirection: "row",
            minHeight: "100px",
            boxSizing: "border-box",
            padding: "0 10px",
          }}
        >
          {isShowUserInput && (
            <>
              <Textarea value={userMessage} onChange={setUserMessage} onSubmit={submitMessage} />
              <IconButton disabled={!userMessage} onClick={submitMessage}>
                <SendHorizontal />
              </IconButton>
            </>
          )}
        </Stack>

        {helpMessage && (
          <Stack
            sx={{
              gap: "10px",
              flexDirection: "row",
              alignItems: "center",
              width: "650px",
              minHeight: "20px",
              maxWidth: "calc(100vw - 33px)",
              boxSizing: "border-box",
              padding: "10px 10px 10px 14px",
              border: `1px solid rgba(255, 255, 255, 0.1)`,
              backgroundColor: `rgba(255, 255, 255, 0.04)`,
              borderRadius: "4px",
            }}
          >
            <Wand
              color={helpMessage === loadingHelpMessage ? "#fa8500" : "#558fdb"}
              size={"16px"}
              style={{
                paddingBottom: "2px",
              }}
            />
            <Typography
              sx={{
                maxWidth: "600px",
                paddingLeft: "3px",
                width: "100%",
                opacity: helpMessage === loadingHelpMessage ? 0.7 : 1,
              }}
            >
              {helpMessage}
            </Typography>

            {helpMessage !== loadingHelpMessage && <AudioPlayIcon text={helpMessage} />}
            <IconButton onClick={() => setHelpMessage("")} size="small">
              <X
                size={"16px"}
                style={{
                  opacity: 0.7,
                }}
              />
            </IconButton>
          </Stack>
        )}

        {isNeedToShowBalanceWarning && (
          <Stack
            sx={{
              alignItems: "flex-end",
              width: "650px",
              maxWidth: "calc(100vw - 33px)",
              boxSizing: "border-box",
              gap: "5px",
            }}
          >
            <Typography
              variant="caption"
              color={isExtremelySmallBalance ? "error" : isSmallBalance ? "warning" : "primary"}
              align="right"
            >
              You have a low balance | {`${convertHoursToHumanFormat(balanceHours)}`} <br />
              It makes sense to top up your balance.
            </Typography>
            <Button
              startIcon={<AddCardIcon />}
              onClick={() => togglePaymentModal(true)}
              variant="contained"
            >
              Top up
            </Button>
          </Stack>
        )}

        <Stack
          sx={{
            width: "650px",
            maxWidth: "calc(100vw - 33px)",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: "row",
            boxSizing: "border-box",
          }}
        >
          <Stack
            sx={{
              alignItems: "center",
              flexDirection: "row",
              gap: "10px",
              animationDelay: "0.5s",
              "@media (max-width: 600px)": {
                gap: "0px",
              },
            }}
          >
            <MicroButton
              isMuted={!!isMuted}
              isPlaying={isUserSpeaking}
              onClick={() => toggleMute(!isMuted)}
            />
            <Stack
              sx={{
                gap: "27px",
                flexDirection: "row",
                "@media (max-width: 600px)": {
                  gap: "10px",
                },
              }}
            >
              <KeyboardButton
                isEnabled={!!isShowUserInput}
                onClick={() => setIsShowUserInput(!isShowUserInput)}
              />
              <HelpButton
                isLoading={false}
                isEnabled={helpMessage !== loadingHelpMessage}
                onClick={generateHelpMessage}
              />
              <VolumeButton isEnabled={isVolumeOn} onClick={() => toggleVolume(!isVolumeOn)} />
            </Stack>
          </Stack>

          {isClosing || isSavingHomework ? (
            <Button variant="outlined" disabled onClick={() => finishLesson()}>
              {isSavingHomework ? "Saving homework..." : "Finishing..."}
            </Button>
          ) : (
            <>
              {isClosed ? (
                <Button
                  variant="contained"
                  onClick={() => doneConversation()}
                  startIcon={<DoneIcon />}
                >
                  Done
                </Button>
              ) : (
                <>
                  {conversation.length > 0 && (
                    <Stack>
                      <Button
                        color={
                          isNeedToShowBalanceWarning
                            ? isExtremelySmallBalance
                              ? "error"
                              : isSmallBalance
                                ? "warning"
                                : "primary"
                            : "primary"
                        }
                        variant="outlined"
                        onClick={() => finishLesson()}
                      >
                        Finish
                      </Button>
                    </Stack>
                  )}
                </>
              )}
            </>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};
