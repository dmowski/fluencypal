"use client";

import { Button, IconButton, Stack, Typography } from "@mui/material";
import { Check, Languages, Loader, ShieldAlert } from "lucide-react";

import { StringDiff } from "react-string-diff";
import { AudioPlayIcon } from "../Audio/AudioPlayIcon";
import { useLingui } from "@lingui/react";
import { useEffect, useRef, useState } from "react";
import { useCorrections } from "../Corrections/useCorrections";
import { useTranslate } from "../Translation/useTranslate";

export const ProcessUserInput = ({
  isTranscribing,
  userMessage,
  setIsAnalyzing,
  setIsNeedCorrection,
  previousBotMessage,
}: {
  isTranscribing: boolean;
  userMessage: string;
  setIsAnalyzing: (value: boolean) => void;
  setIsNeedCorrection: (value: boolean) => void;
  previousBotMessage: string;
}) => {
  const { i18n } = useLingui();
  const [isNeedToShowCorrection, setIsNeedToShowCorrection] =
    useState<boolean>(false);

  const messageAnalyzing = useRef("");
  const translator = useTranslate();

  const [isAnalyzingMessageWithAi, setIsAnalyzingMessageWithAi] =
    useState(false);
  const [description, setDescription] = useState<string | null>(null);
  const [correctedMessage, setCorrectedMessage] = useState<string | null>(null);
  const corrections = useCorrections();
  const [isAnalyzingError, setIsAnalyzingError] = useState(false);

  const [isShowFullContent, setIsShowFullContent] = useState(false);
  const [rate, setRate] = useState<number | null>(null);

  const setIsAnalyzingMessage = (value: boolean) => {
    setIsAnalyzingMessageWithAi(value);
    setIsAnalyzing(value);
  };

  const setIsCorrection = (value: boolean) => {
    setIsNeedCorrection(value);
    setIsNeedToShowCorrection(value);
  };

  const analyzeUserInput = async (usersNewMessage: string) => {
    messageAnalyzing.current = usersNewMessage;
    setIsAnalyzingError(false);

    setIsAnalyzingMessage(true);
    setIsCorrection(false);
    setDescription(null);
    setCorrectedMessage(null);
    setRate(null);

    try {
      const userMessage = usersNewMessage;

      const { sourceMessage, correctedMessage, description, rate } =
        await corrections.analyzeUserMessage({
          previousBotMessage,
          message: userMessage,
          conversationId: "chat",
        });
      if (usersNewMessage !== sourceMessage) {
        return;
      }

      const isBad =
        !!description &&
        !!correctedMessage?.trim() &&
        correctedMessage.toLowerCase().trim() !==
          sourceMessage.toLowerCase().trim();
      setIsCorrection(isBad);
      setRate(rate);

      setCorrectedMessage(isBad ? correctedMessage || null : null);
      setDescription(isBad ? description || null : null);
      setIsAnalyzingMessage(false);
    } catch (error) {
      console.error("Error during analyzing message", error);
      setIsAnalyzingError(true);
      setIsAnalyzingMessage(false);
      throw error;
    }
  };

  useEffect(() => {
    if (userMessage) {
      analyzeUserInput(userMessage);
    } else {
      setIsAnalyzingMessage(false);
      setIsCorrection(false);
      setDescription(null);
      setCorrectedMessage(null);
    }
  }, [userMessage]);

  useEffect(() => {
    if (isTranscribing) {
      setIsAnalyzingMessage(true);
    }
  }, [isTranscribing]);

  const isAnalyzingResponse = isAnalyzingMessageWithAi || isTranscribing;

  const contentToShow = description || "";
  const limitMessages = 120;
  const isLimitedMessage =
    contentToShow.length > limitMessages && !isShowFullContent;
  const messagesFontSize = userMessage.length < 320 ? "1.1rem" : "0.9rem";

  const [isTranslatingCorrectedMessage, setIsTranslatingCorrectedMessage] =
    useState(false);
  const [translatedCorrectedMessage, setTranslatedCorrectedMessage] = useState<
    string | null
  >(null);

  const onTranslateCorrectedMessage = async () => {
    if (!correctedMessage) return;
    if (translatedCorrectedMessage) {
      setTranslatedCorrectedMessage(null);
      return;
    }
    setIsTranslatingCorrectedMessage(true);
    const translated = await translator.translateText({
      text: correctedMessage || "",
    });
    setTranslatedCorrectedMessage(translated);
    setIsTranslatingCorrectedMessage(false);
  };

  return (
    <Stack
      sx={{
        width: "100%",
      }}
    >
      <Stack
        sx={{
          alignItems: "flex-start",
          gap: "15px",
        }}
      >
        {isAnalyzingError && (
          <Typography color="error">
            {i18n._(
              "An error occurred while analyzing the message. Please try again.",
            )}
          </Typography>
        )}
        <Stack
          sx={{
            flexDirection: "row",
            alignItems: "center",
            gap: "15px",
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          <Stack
            sx={{
              flexDirection: "row",
              alignItems: "center",
              gap: "15px",
            }}
          >
            <Stack
              sx={{
                height: "40px",
                width: "40px",
                borderRadius: "50%",
                alignItems: "center",
                justifyContent: "center",
                background: isAnalyzingResponse
                  ? "rgba(255, 255, 255, 0.06)"
                  : isNeedToShowCorrection
                    ? "linear-gradient(45deg, #2b3cadff 0%, #4e5ec3ff 100%)"
                    : "linear-gradient(45deg, #63b187 0%, #7bd5a1 100%)",
              }}
            >
              {isNeedToShowCorrection && !isAnalyzingResponse ? (
                <ShieldAlert color="#fff" size={"21px"} strokeWidth={"2.3px"} />
              ) : (
                <>
                  {isAnalyzingResponse ? (
                    <Loader color="#fff" size={"21px"} strokeWidth={"4px"} />
                  ) : (
                    <Check color="#fff" size={"21px"} strokeWidth={"4px"} />
                  )}
                </>
              )}
            </Stack>

            {isNeedToShowCorrection && !isAnalyzingResponse ? (
              <Typography variant="h6">{i18n._("Almost correct")}</Typography>
            ) : (
              <>
                {isAnalyzingResponse ? (
                  <Typography
                    className="loading-shimmer"
                    sx={{
                      color: "#fff",
                      display: "inline",
                    }}
                    variant="h6"
                  >
                    {i18n._("Analyzing...")}
                  </Typography>
                ) : (
                  <Typography variant="h6">{i18n._("Great!")}</Typography>
                )}
              </>
            )}
          </Stack>
          {!!rate && (
            <Typography
              variant="body2"
              sx={{
                opacity: 0.7,
              }}
            >
              {rate}/10
            </Typography>
          )}
        </Stack>

        {isNeedToShowCorrection && (
          <Stack>
            {description && (
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.87,
                }}
              >
                {contentToShow.length > limitMessages ? (
                  <>
                    {isLimitedMessage
                      ? contentToShow.slice(0, limitMessages) + "..."
                      : contentToShow}

                    <Button
                      size="small"
                      onClick={() => setIsShowFullContent(!isShowFullContent)}
                      sx={{
                        textTransform: "none",
                        marginLeft: "5px",
                        padding: 0,
                        minWidth: 0,
                      }}
                    >
                      {isShowFullContent
                        ? i18n._("Show less")
                        : i18n._("Show more")}
                    </Button>
                  </>
                ) : (
                  contentToShow
                )}
              </Typography>
            )}
          </Stack>
        )}
        <Stack
          sx={{
            gap: "0px",
            paddingBottom: "10px",
          }}
        >
          <Stack>
            <Typography
              variant="caption"
              sx={{
                opacity: 0.7,
                fontWeight: 350,
              }}
            >
              {i18n._("Your Message")}
            </Typography>
            <Stack
              sx={{
                width: "100%",
                gap: "12px",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Typography
                variant="body2"
                component={"div"}
                className={isTranscribing ? "loading-shimmer" : ""}
                sx={{
                  fontWeight: 400,
                  fontSize: messagesFontSize,
                  paddingBottom: "3px",
                  opacity: isTranscribing ? 0.7 : 0.9,
                }}
              >
                <StringDiff
                  oldValue={
                    isTranscribing
                      ? i18n._("Transcribing...")
                      : userMessage || ""
                  }
                  newValue={
                    isTranscribing
                      ? i18n._("Transcribing...")
                      : userMessage || ""
                  }
                />
              </Typography>
            </Stack>
          </Stack>

          {(isNeedToShowCorrection || isAnalyzingResponse) && (
            <Stack
              sx={{
                paddingTop: "15px",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.7,
                  fontWeight: 350,
                }}
              >
                {i18n._("Corrected")}
              </Typography>

              <Stack
                sx={{
                  width: "100%",
                  gap: "12px",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="body2"
                  component={"div"}
                  className={
                    isTranscribing || isAnalyzingResponse
                      ? "loading-shimmer"
                      : ""
                  }
                  sx={{
                    fontWeight: 400,
                    fontSize: messagesFontSize,
                    paddingBottom: "3px",
                    opacity: isTranscribing || isAnalyzingResponse ? 0.7 : 0.9,
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
                    oldValue={
                      translatedCorrectedMessage
                        ? translatedCorrectedMessage
                        : isTranscribing
                          ? i18n._("Transcribing...")
                          : isAnalyzingResponse
                            ? i18n._("Analyzing...")
                            : userMessage || ""
                    }
                    newValue={
                      translatedCorrectedMessage
                        ? translatedCorrectedMessage
                        : isTranscribing
                          ? i18n._("Transcribing...")
                          : isAnalyzingResponse
                            ? i18n._("Analyzing...")
                            : correctedMessage || userMessage || ""
                    }
                  />
                </Typography>
              </Stack>
            </Stack>
          )}

          {!isTranscribing && !isAnalyzingResponse && !!correctedMessage && (
            <Stack
              sx={{
                flexDirection: "row",
                alignItems: "center",
                gap: "2px",
              }}
            >
              <AudioPlayIcon
                text={correctedMessage}
                instructions="Calm and clear"
                voice={"shimmer"}
              />
              <IconButton
                onClick={onTranslateCorrectedMessage}
                disabled={isTranslatingCorrectedMessage}
              >
                <Languages size={"16px"} style={{ opacity: 0.8 }} />
              </IconButton>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};
