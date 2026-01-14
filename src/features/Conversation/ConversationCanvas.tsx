"use client";

import { Markdown } from "../uiKit/Markdown/Markdown";
import { JSX, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Popover,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ArrowUp,
  Check,
  CircleEllipsis,
  Keyboard,
  Lightbulb,
  Loader,
  LogOut,
  Mic,
  Send,
  Trash2,
  Trophy,
} from "lucide-react";
import VideocamIcon from "@mui/icons-material/Videocam";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";

import { AliasGamePanel } from "./AliasGamePanel";
import { ChatMessage, MessagesOrderMap } from "@/common/conversation";
import { GuessGameStat } from "./types";
import dayjs from "dayjs";
import { useLingui } from "@lingui/react";
import { useSound } from "../Audio/useSound";
import { GoalPlan } from "../Plan/types";
import { useTranslate } from "../Translation/useTranslate";
import { useUrlParam } from "../Url/useUrlParam";
import { useResizeElement } from "../Layout/useResizeElement";
import { Messages } from "./Messages";
import { AiVoice } from "@/common/ai";
import { CameraCanvas } from "./CallMode/CameraCanvas";
import { ConversationMode } from "@/common/user";
import { ProcessUserInput } from "./ProcessUserInput";
import { AudioPlayIcon } from "../Audio/AudioPlayIcon";
import { ConversationReviewModal } from "./ConversationReviewModal";
import { LessonPlanAnalysis } from "../LessonPlan/type";

interface ConversationCanvasProps {
  conversation: ChatMessage[];
  isAiSpeaking: boolean;
  gameWords: GuessGameStat | null;
  isClosed: boolean;
  isClosing: boolean;

  addUserMessage: (message: string) => Promise<void>;
  balanceHours: number;
  recordingError: string;
  togglePaymentModal: (isOpen: boolean) => void;
  closeConversation: () => void;
  transcriptMessage?: string;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  cancelRecording: () => Promise<void>;
  isTranscribing: boolean;
  isRecording: boolean;
  recordingMilliSeconds: number;
  recordVisualizerComponent: JSX.Element | null;

  isMuted: boolean;
  setIsMuted: (newState: boolean) => void;

  isShowMessageProgress: boolean;
  conversationAnalysisResult: string;
  analyzeConversation: () => Promise<void>;
  generateHelpMessage: () => Promise<string>;
  toggleConversationMode: (mode: ConversationMode) => void;
  conversationMode: ConversationMode;
  voice: AiVoice | null;

  messageOrder: MessagesOrderMap;

  onWebCamDescription: (description: string) => void;

  isVolumeOn: boolean;
  setIsVolumeOn: (value: boolean) => void;
  isLimited: boolean;
  onLimitedClick: () => void;
  pointsEarned: number;
  openCommunityPage: () => void;

  lessonPlanAnalysis: LessonPlanAnalysis | null;
}
export const ConversationCanvas: React.FC<ConversationCanvasProps> = ({
  toggleConversationMode,
  conversation,
  isAiSpeaking,
  gameWords,
  isClosed,
  isClosing,
  addUserMessage,
  togglePaymentModal,

  transcriptMessage,
  startRecording,
  stopRecording,
  cancelRecording,
  isTranscribing,
  isRecording,
  recordingMilliSeconds,
  recordVisualizerComponent,
  recordingError,

  isMuted,
  setIsMuted,
  closeConversation,
  conversationAnalysisResult,
  analyzeConversation,

  generateHelpMessage,

  isVolumeOn,
  setIsVolumeOn,
  isLimited,
  onLimitedClick,
  voice,
  messageOrder,
  onWebCamDescription,
  conversationMode,
  pointsEarned,
  openCommunityPage,

  lessonPlanAnalysis,
}) => {
  const { i18n } = useLingui();
  const sound = useSound();
  const isChatMode = conversationMode === "chat";
  const isRecordMode = conversationMode === "record";
  const isCallMode = conversationMode === "call";

  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const closeMenus = () => setAnchorElUser(null);

  const isFinishingProcess = isClosing || isClosed;
  const { ref, size } = useResizeElement<HTMLDivElement>();
  const height = size.height || 0;

  const bottomSectionHeight = `${height + 40}px`;

  const messageAnalyzing = useRef("");
  const [isAnalyzingMessageWithAi, setIsAnalyzingMessageWithAi] = useState(false);
  const [isNeedToShowCorrection, setIsNeedToShowCorrection] = useState(false);
  const [internalUserInput, setInternalUserInput] = useState<string>("");
  const [isConfirmedUserKeyboardInput, setIsConfirmedUserKeyboardInput] = useState(false);

  const confirmedUserInput =
    transcriptMessage || (isConfirmedUserKeyboardInput ? internalUserInput : "");
  const isAnalyzingResponse = isAnalyzingMessageWithAi || isTranscribing;

  const analyzeUserKeyboardInput = async () => {
    if (internalUserInput === messageAnalyzing.current || !internalUserInput) {
      return;
    }
    setIsConfirmedUserKeyboardInput(true);
  };

  useEffect(() => {
    const isWindow = typeof window !== "undefined";
    if (!isWindow) return;

    const scrollToBottom = () => {
      window.scrollTo({
        top: document.body.scrollHeight + 200,
        behavior: "smooth",
      });

      const callModeMessagesElement = document.getElementById("messages-call-mode");
      if (callModeMessagesElement) {
        callModeMessagesElement.scrollTo({
          top: callModeMessagesElement.scrollHeight,
          behavior: "smooth",
        });
      }
    };
    const timeout = setTimeout(() => {
      scrollToBottom();
    }, 100);

    return () => {
      clearTimeout(timeout);
    };
  }, [conversation, isAnalyzingResponse, isRecording]);

  const [isShowAnalyzeConversationModal, setIsShowAnalyzeConversationModal] = useUrlParam(
    "showAnalyzeConversationModal"
  );
  const [isConversationContinueAfterAnalyze, setIsConversationContinueAfterAnalyze] =
    useState(false);
  const showAnalyzeConversationModal = () => {
    analyzeConversation();
    setIsShowAnalyzeConversationModal(true);
  };

  const translator = useTranslate();

  const [isOpenHelpModelAnchor, setIsOpenHelpModelAnchor] = useState<HTMLElement | null>(null);
  const [helpMessage, setHelpMessage] = useState("");
  const openHelpAnswer = async (element: HTMLElement) => {
    setHelpMessage("");
    setIsOpenHelpModelAnchor(element);
    const mess = await generateHelpMessage();
    setHelpMessage(mess);
  };

  const loadingMessage = i18n._(`Loading...`);

  const lastBotMessage = useMemo(() => {
    for (let i = conversation.length - 1; i >= 0; i--) {
      if (conversation[i].isBot) {
        return conversation[i].text;
      }
    }
    return "";
  }, [conversation]);

  const modals = (
    <>
      {translator.translateModal}
      {isOpenHelpModelAnchor && (
        <Popover
          anchorEl={isOpenHelpModelAnchor}
          open={!!isOpenHelpModelAnchor}
          onClose={() => setIsOpenHelpModelAnchor(null)}
          slotProps={{
            backdrop: {
              sx: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
              },
            },
          }}
        >
          <Stack
            sx={{
              gap: "0px",
              backgroundColor: "#333",
              boxSizing: "border-box",
              width: "100%",
              maxWidth: "600px",
              padding: "10px 15px",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                opacity: 0.7,
              }}
            >
              {i18n._("Idea for your message")}
            </Typography>

            <Stack
              className={`decor-text ${!helpMessage ? "loading-shimmer" : ""}`}
              sx={{
                flexDirection: "row",
                gap: "10px",
                minHeight: "35px",
              }}
            >
              <Markdown
                variant="conversation"
                onWordClick={
                  translator.isTranslateAvailable
                    ? (word, element) => translator.translateWithModal(word, element)
                    : undefined
                }
              >
                {!helpMessage ? loadingMessage : helpMessage}
              </Markdown>
              {helpMessage && (
                <AudioPlayIcon text={helpMessage} instructions="Calm and clear" voice={"coral"} />
              )}
            </Stack>
          </Stack>
        </Popover>
      )}
      {isShowAnalyzeConversationModal && (
        <ConversationReviewModal
          setIsShowAnalyzeConversationModal={setIsShowAnalyzeConversationModal}
          conversationAnalysisResult={conversationAnalysisResult}
          closeConversation={() => {
            setIsShowAnalyzeConversationModal(false);
            closeConversation();
          }}
          setIsConversationContinueAfterAnalyze={setIsConversationContinueAfterAnalyze}
          pointsEarned={pointsEarned}
          openCommunityPage={() => {
            setIsShowAnalyzeConversationModal(false);
            closeConversation();
            openCommunityPage();
          }}
        />
      )}
    </>
  );

  const isCompletedLesson =
    !isConversationContinueAfterAnalyze &&
    (lessonPlanAnalysis ? (lessonPlanAnalysis.progress || 0) > 99 : false);

  if (isCallMode) {
    return (
      <CameraCanvas
        lessonPlanAnalysis={lessonPlanAnalysis}
        messageOrder={messageOrder}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        isAiSpeaking={isAiSpeaking}
        voice={voice}
        conversation={conversation}
        stopCallMode={() => toggleConversationMode("record")}
        onWebCamDescription={onWebCamDescription}
        isVolumeOn={isVolumeOn}
        setIsVolumeOn={setIsVolumeOn}
        isLimited={isLimited}
        onLimitedClick={onLimitedClick}
        onSubmitTranscription={addUserMessage}
        isCompletedLesson={isCompletedLesson}
        onShowAnalyzeConversationModal={() => {
          toggleConversationMode("record");
          showAnalyzeConversationModal();
        }}
      />
    );
  }

  const progress = lessonPlanAnalysis ? lessonPlanAnalysis.progress || 0 : 0;

  return (
    <Stack>
      {modals}

      <Stack
        sx={{
          width: "100%",
          alignItems: "center",
          opacity: isFinishingProcess ? 0.2 : 1,
        }}
      >
        <Stack
          sx={{
            maxWidth: "900px",
            padding: "0",

            boxSizing: "border-box",
            gap: "0px",
            alignItems: "center",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            minHeight: "calc(100dvh - 0px)",
            justifyContent: "space-between",

            "@media (max-width: 600px)": {
              border: "none",
            },
            backgroundColor: "#1c2128",
            width: "100%",
          }}
        >
          <Messages
            conversation={conversation}
            messageOrder={messageOrder}
            isAiSpeaking={isAiSpeaking}
          />
          <Stack
            sx={{
              height: bottomSectionHeight,
              //backgroundColor: "rgba(255, 33, 40, 0.1)",
              width: "100%",
            }}
          />
        </Stack>

        <Stack
          ref={ref}
          sx={{
            flexDirection: "column",
            width: "100%",
            borderTop: confirmedUserInput
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(255, 255, 255, 0.1)",

            position: "fixed",
            bottom: "0px",
            left: 0,

            "--section-bg": "#252b33",
            backgroundColor: "var(--section-bg)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Stack
            sx={{
              position: "absolute",
              top: "-5px",
              left: "0px",
              width: "calc(100% - 0px)",
              height: "4px",
              borderRadius: "0",
              overflow: "hidden",
            }}
          >
            <Stack
              sx={{
                width: `${progress}%`,
                height: "100%",
                position: "absolute",
                top: 0,
                left: "0px",
                background: "linear-gradient(90deg, rgba(46, 193, 233, 1), rgba(0, 166, 255, 1))",
                transition: "width 0.3s ease-in-out",
              }}
            />
          </Stack>

          {gameWords?.wordsUserToDescribe && (
            <Stack
              sx={{
                width: "100%",
                alignItems: "center",
                padding: "10px",
                boxSizing: "border-box",
              }}
            >
              <Stack
                sx={{
                  width: "100%",
                  maxWidth: "900px",
                  maxHeight: "40vh",
                  overflowY: "auto",
                }}
              >
                <AliasGamePanel gameWords={gameWords} conversation={conversation} />
              </Stack>
            </Stack>
          )}

          <Stack
            sx={{
              width: "100%",
              boxSizing: "border-box",
              maxWidth: "900px",
              padding: "20px 20px",
              borderTop: "none",
              borderBottom: "none",
              "@media (max-width: 600px)": {
                border: "none",
              },
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {recordingError && (
              <Stack>
                <Alert
                  severity="error"
                  variant="filled"
                  sx={{
                    width: "100%",
                    maxWidth: "900px",
                    backgroundColor: "#c4574f",
                    color: "#fff",
                    boxSizing: "border-box",
                  }}
                >
                  {recordingError || i18n._("Error during analyzing message")}
                </Alert>
              </Stack>
            )}

            {(confirmedUserInput || isTranscribing || isAnalyzingResponse) && (
              <ProcessUserInput
                isTranscribing={isTranscribing}
                userMessage={confirmedUserInput}
                setIsAnalyzing={setIsAnalyzingMessageWithAi}
                setIsNeedCorrection={setIsNeedToShowCorrection}
                previousBotMessage={lastBotMessage}
              />
            )}

            {!isFinishingProcess && (
              <Stack
                sx={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "100%",
                  "@media (max-width: 600px)": {
                    alignItems: "flex-end",
                    gap: "10px",
                  },
                }}
              >
                <Stack
                  sx={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    width: "100%",
                    gap: "15px",
                    "@media (max-width: 600px)": {
                      flexDirection: "column-reverse",
                      alignItems: "flex-start",
                    },
                  }}
                >
                  {isAnalyzingResponse && (
                    <Button
                      startIcon={<Loader />}
                      size="large"
                      variant="contained"
                      sx={{
                        minWidth: "200px",
                      }}
                      disabled
                    >
                      {i18n._("Analyzing")}
                    </Button>
                  )}

                  {confirmedUserInput && !isRecording && !isAnalyzingResponse && (
                    <Button
                      startIcon={<ArrowUp />}
                      size="large"
                      variant={"contained"}
                      sx={{
                        minWidth: "200px",
                      }}
                      onClick={async () => {
                        addUserMessage(confirmedUserInput);
                        setIsConfirmedUserKeyboardInput(false);
                        setInternalUserInput("");
                      }}
                    >
                      {i18n._("Send")}
                    </Button>
                  )}

                  {transcriptMessage &&
                    !isRecording &&
                    !isAnalyzingResponse &&
                    isNeedToShowCorrection && (
                      <Button
                        size="large"
                        variant="outlined"
                        startIcon={<Mic />}
                        onClick={async () => await startRecording()}
                        sx={{
                          minWidth: "200px",
                        }}
                      >
                        {i18n._("Re-record")}
                      </Button>
                    )}

                  {isRecording && !isAnalyzingResponse && (
                    <Button
                      startIcon={<Check />}
                      size="large"
                      variant="contained"
                      sx={{
                        minWidth: "200px",
                      }}
                      onClick={async () => stopRecording()}
                    >
                      {i18n._("Done")}
                    </Button>
                  )}

                  {!transcriptMessage &&
                    !isRecording &&
                    !isAnalyzingResponse &&
                    !isCallMode &&
                    !isCompletedLesson &&
                    !isChatMode && (
                      <Stack
                        sx={{
                          flexDirection: "row",
                          alignItems: "center",
                          width: "100%",
                          gap: "10px",
                        }}
                      >
                        <Button
                          startIcon={<Mic />}
                          size="large"
                          variant="contained"
                          sx={{
                            minWidth: "200px",
                          }}
                          onClick={async () => startRecording()}
                        >
                          {i18n._("Record Message")}
                        </Button>

                        <IconButton onClick={(e) => setAnchorElUser(e.currentTarget)}>
                          <CircleEllipsis />
                        </IconButton>
                      </Stack>
                    )}

                  <Menu
                    sx={{
                      marginBottom: "130px",
                    }}
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "left",
                    }}
                    keepMounted
                    open={Boolean(anchorElUser)}
                    onClose={() => setAnchorElUser(null)}
                  >
                    <MenuItem
                      sx={{}}
                      disabled={isFinishingProcess}
                      onClick={() => {
                        closeConversation();
                        closeMenus();
                      }}
                    >
                      <ListItemIcon>
                        <LogOut />
                      </ListItemIcon>
                      <ListItemText>
                        <Typography>{i18n._("Finish")}</Typography>
                      </ListItemText>
                    </MenuItem>

                    <Divider />

                    <MenuItem
                      disabled={isRecording || isAnalyzingResponse || (!isCallMode && !isChatMode)}
                      onClick={() => {
                        toggleConversationMode("record");
                        closeMenus();
                      }}
                    >
                      <ListItemIcon>
                        <Mic />
                      </ListItemIcon>
                      <ListItemText>
                        <Typography>{i18n._("Voice record mode")}</Typography>
                      </ListItemText>

                      {!isCallMode && !isChatMode && (
                        <ListItemIcon>
                          <Check />
                        </ListItemIcon>
                      )}
                    </MenuItem>

                    <MenuItem
                      sx={{}}
                      disabled={isRecording || isAnalyzingResponse || isChatMode}
                      onClick={() => {
                        toggleConversationMode("chat");
                        closeMenus();
                      }}
                    >
                      <ListItemIcon>
                        <Keyboard />
                      </ListItemIcon>
                      <ListItemText>
                        <Typography>{i18n._("Keyboard mode")}</Typography>
                      </ListItemText>

                      {isChatMode && (
                        <ListItemIcon>
                          <Check />
                        </ListItemIcon>
                      )}
                    </MenuItem>

                    <MenuItem
                      sx={{}}
                      disabled={isRecording || isAnalyzingResponse || isCallMode}
                      onClick={() => {
                        alert(i18n._("Call mode is coming soon!"));
                        //toggleConversationMode("call");
                        //closeMenus();
                      }}
                    >
                      <ListItemIcon>
                        <VideocamIcon />
                      </ListItemIcon>
                      <ListItemText>
                        <Typography>{i18n._("Call mode")}</Typography>
                      </ListItemText>

                      {isCallMode && (
                        <ListItemIcon>
                          <Check />
                        </ListItemIcon>
                      )}
                    </MenuItem>

                    <Divider />
                    <MenuItem
                      sx={{}}
                      disabled={isRecording || isAnalyzingResponse || isLimited}
                      onClick={(e) => {
                        openHelpAnswer(e.currentTarget);
                        closeMenus();
                      }}
                    >
                      <ListItemIcon>
                        <Lightbulb />
                      </ListItemIcon>
                      <ListItemText>
                        <Typography>{i18n._("Help with answer")}</Typography>
                      </ListItemText>
                    </MenuItem>
                  </Menu>

                  {!confirmedUserInput &&
                    !isRecording &&
                    !isAnalyzingResponse &&
                    !isCompletedLesson &&
                    isChatMode && (
                      <Stack
                        sx={{
                          flexDirection: "row",
                          alignItems: "center",
                          width: "100%",
                          gap: "5px",
                        }}
                      >
                        <TextField
                          autoFocus
                          value={internalUserInput}
                          onChange={(e) => setInternalUserInput(e.target.value)}
                          placeholder={i18n._("Your message...")}
                          multiline
                          minRows={1}
                          onKeyDown={(e) => {
                            const isEnter = e.key === "Enter" && !e.shiftKey;
                            if (isEnter) {
                              e.preventDefault();
                              analyzeUserKeyboardInput();
                            }
                          }}
                          sx={{
                            width: "100%",
                            minHeight: "40px",
                            maxWidth: "500px",
                          }}
                          slotProps={{
                            input: {
                              sx: {
                                height: "100%",
                                padding: "4px 0 3px 0",
                              },
                              inputProps: {
                                style: {
                                  padding: "2px 8px",
                                },
                              },
                            },
                          }}
                        />
                        <IconButton
                          onClick={() => analyzeUserKeyboardInput()}
                          disabled={!internalUserInput}
                        >
                          <Send size={"20px"} />
                        </IconButton>

                        <IconButton onClick={(e) => setAnchorElUser(e.currentTarget)}>
                          <CircleEllipsis />
                        </IconButton>
                      </Stack>
                    )}

                  {isCompletedLesson && (
                    <Stack
                      sx={{
                        alignItems: "flex-start",
                        gap: "5px",
                      }}
                    >
                      <Typography>{i18n._("Mission complete")}</Typography>
                      <Button
                        startIcon={<Trophy />}
                        size="large"
                        color="info"
                        variant="contained"
                        onClick={async () => showAnalyzeConversationModal()}
                      >
                        {i18n._("Open results")}
                      </Button>
                    </Stack>
                  )}

                  {transcriptMessage &&
                    !isRecording &&
                    !isAnalyzingResponse &&
                    !isNeedToShowCorrection && (
                      <Button
                        size="large"
                        startIcon={<Mic />}
                        onClick={async () => await startRecording()}
                      >
                        {i18n._("Re-record")}
                      </Button>
                    )}

                  {confirmedUserInput &&
                    !isRecording &&
                    !transcriptMessage &&
                    isNeedToShowCorrection && (
                      <Button
                        size="large"
                        startIcon={<Keyboard />}
                        onClick={async () => {
                          setIsConfirmedUserKeyboardInput(false);
                          messageAnalyzing.current = "";
                        }}
                      >
                        {i18n._("Re-write")}
                      </Button>
                    )}

                  {isRecording && (
                    <Stack
                      sx={{
                        width: "max-content",
                        overflow: "hidden",
                        height: "40px",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "0 10px 10px 0",
                        alignItems: "center",
                        justifyContent: "space-between",
                        position: "relative",
                        flexDirection: "row",
                        gap: "10px",
                        padding: "0 10px 0 0px",
                        left: "-16px",
                        zIndex: 0,
                        "@media (max-width: 600px)": {
                          left: 0,
                          borderRadius: "10px",
                        },
                      }}
                    >
                      {recordVisualizerComponent}
                      <Stack
                        sx={{
                          position: "absolute",
                          width: "calc(100% - 45px)",
                          height: "120%",
                          top: "-10%",
                          left: 0,
                          boxShadow: "inset 0 0 10px 10px var(--section-bg, rgba(20, 28, 40, 1))",
                        }}
                      ></Stack>
                      <Typography
                        variant="caption"
                        sx={{
                          width: "30px",
                        }}
                      >
                        {dayjs(recordingMilliSeconds).format("mm:ss")}
                      </Typography>
                    </Stack>
                  )}
                </Stack>

                {(isRecording || isLimited) && (
                  <Stack
                    sx={{
                      width: "100%",
                      alignItems: "flex-end",
                      "@media (max-width: 600px)": {
                        alignItems: "flex-start",
                      },
                    }}
                  >
                    {isRecording ? (
                      <Tooltip title={i18n._("Cancel recording")}>
                        <Stack>
                          <IconButton
                            sx={{}}
                            size="large"
                            color="error"
                            onClick={() => cancelRecording()}
                          >
                            <Trash2 size={"18px"} />
                          </IconButton>
                        </Stack>
                      </Tooltip>
                    ) : (
                      <>
                        {isLimited && (
                          <Stack
                            sx={{
                              alignItems: "flex-end",
                              boxSizing: "border-box",
                              gap: "5px",
                              width: "100%",
                            }}
                          >
                            <IconButton
                              sx={{
                                boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.11)",
                                background:
                                  "linear-gradient(130deg, rgba(255, 255, 255, 0.07), rgba(244, 244, 244, 0.02))",
                              }}
                              onClick={() => togglePaymentModal(true)}
                            >
                              <VolumeOffIcon />
                            </IconButton>
                          </Stack>
                        )}
                      </>
                    )}
                  </Stack>
                )}
              </Stack>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};
