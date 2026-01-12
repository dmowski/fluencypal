"use client";
import { Button, Stack, Tooltip, Typography } from "@mui/material";
import { Check, ChevronLeft, Loader, RefreshCw, RotateCcw } from "lucide-react";

import { ReactNode, useEffect, useState } from "react";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { useLingui } from "@lingui/react";
import { goFullScreen } from "@/libs/fullScreen";
import { useWebCam } from "../webCam/useWebCam";
import { WebCamView } from "../webCam/WebCamView";
import VideocamIcon from "@mui/icons-material/Videocam";
import MicIcon from "@mui/icons-material/Mic";
import { GoalElementInfo, PlanElementMode } from "./types";
import { useSettings } from "../Settings/useSettings";
import { useWords } from "../Words/useWords";
import { useAiConversation } from "../Conversation/useAiConversation";
import { useRules } from "../Rules/useRules";
import { InfoStep } from "../Survey/InfoStep";
import { on } from "events";
import { ConversationMode } from "@/common/user";
import { ConversationType } from "@/common/conversation";

type Step = "intro" | "mic" | "webcam" | "words" | "rules" | "start";

const elementSteps: Record<PlanElementMode, Step[]> = {
  conversation: ["intro", "mic", "webcam", "start"],
  words: ["intro", "mic", "words", "start"],
  play: ["intro", "mic", "webcam", "start"],
  rule: ["intro", "mic", "rules", "start"],
};

const conversationModes: Record<PlanElementMode, ConversationMode> = {
  conversation: "call",
  words: "record",
  play: "call",
  rule: "record",
};

// AI Conversation types
const conversationTypes: Record<PlanElementMode, ConversationType> = {
  conversation: "goal-talk",
  words: "words",
  play: "goal-role-play",
  rule: "rule",
};

export const LessonStartModal = ({
  title,
  subTitle,
  description,
  icon,
  onClose,
  goalInfo,
}: {
  title: string;
  subTitle: string;
  description?: string;
  icon: ReactNode;
  onClose: () => void;
  goalInfo: GoalElementInfo;
}) => {
  const { i18n } = useLingui();
  const webcam = useWebCam();
  const settings = useSettings();
  const words = useWords();
  const rules = useRules();
  const aiConversation = useAiConversation();

  const [allowWebCam, setAllowWebCam] = useState<boolean | null>(null);
  const conversationMode = conversationModes[goalInfo.goalElement.mode];

  const conversationType = conversationTypes[goalInfo.goalElement.mode];

  const steps: Step[] = elementSteps[goalInfo.goalElement.mode];
  const [step, setStep] = useState<Step>(steps[0]);

  const [isMicAllowed, setIsMicAllowed] = useState<boolean | null>(null);

  const [ruleToLearn, setRuleToLearn] = useState<string>("");

  const [wordsToLearn, setWordsToLearn] = useState<string[]>([]);
  const [isWordsLoading, setIsWordsLoading] = useState<boolean>(false);

  const loadWords = async () => {
    setIsWordsLoading(true);
    const wordsList = await words.getNewWordsToLearn(goalInfo);

    setWordsToLearn(wordsList);
    setIsWordsLoading(false);
  };

  useEffect(() => {
    if (steps.includes("words") && !isWordsLoading && !words.isGeneratingWords) {
      loadWords();
    }
  }, []);

  const onNext = () => {
    const currentStepIndex = steps.indexOf(step);
    if (currentStepIndex < steps.length - 1) {
      setStep(steps[currentStepIndex + 1]);
    }
  };
  const [imageDescription, setImageDescription] = useState<string>("");
  const [loadingImageDescription, setLoadingImageDescription] = useState<boolean>(false);

  const doneWebCamSetup = async () => {
    let tempDescription = "";
    setLoadingImageDescription(true);

    setTimeout(async () => {
      onNext();
    }, 500);

    try {
      tempDescription = allowWebCam ? (await webcam.getImageDescription()) || "" : "";
    } catch (error) {
      console.error("Error getting image description:", error);
    }

    if (tempDescription) {
      setImageDescription(tempDescription);
    }
    setLoadingImageDescription(false);
  };

  const [isStarting, setIsStarting] = useState<boolean>(false);
  const onStart = async () => {
    setIsStarting(true);
    if (settings.conversationMode !== conversationMode) {
      await settings.setConversationMode(conversationMode);
    }

    aiConversation.startConversation({
      mode: conversationType,
      goal: goalInfo,
      webCamDescription: imageDescription,
      conversationMode,
      wordsToLearn: wordsToLearn,
    });

    setIsStarting(false);
    // onClose();
  };

  return (
    <CustomModal isOpen={true} onClose={() => onClose()}>
      <Stack
        sx={{
          maxWidth: "700px",
          width: "100%",
        }}
      >
        {step === "intro" && (
          <InfoStep
            title={goalInfo.goalElement.title}
            subTitle={goalInfo.goalElement.subTitle || goalInfo.goalElement.description}
            subComponent={
              <Typography
                sx={{
                  marginTop: "10px",
                }}
              >
                {goalInfo.goalElement.details}
              </Typography>
            }
            onClick={onNext}
          />
        )}

        {step === "mic" && (
          <InfoStep
            title={i18n._(`Microphone Setup`)}
            subTitle={i18n._(`Make sure your microphone is working properly.`)}
            subComponent={
              <Stack
                sx={{
                  gap: "10px",
                  paddingTop: "10px",
                  alignItems: "flex-start",
                }}
              >
                <Button
                  variant="contained"
                  color="info"
                  sx={{
                    padding: "10px 20px",
                  }}
                  startIcon={<MicIcon />}
                  endIcon={isMicAllowed === null ? <></> : isMicAllowed ? <Check /> : <></>}
                  disabled={isMicAllowed === true}
                  onClick={async () => {
                    try {
                      await navigator.mediaDevices.getUserMedia({ audio: true });
                      setIsMicAllowed(true);
                    } catch (error) {
                      setIsMicAllowed(false);
                    }
                  }}
                >
                  {i18n._(`Allow Microphone Access`)}
                </Button>
                {isMicAllowed === false && (
                  <Typography sx={{ color: "red", marginTop: "10px" }}>
                    {i18n._(`Microphone access denied. Please enable it in your browser settings.`)}
                  </Typography>
                )}
              </Stack>
            }
            disabled={!isMicAllowed}
            onClick={onNext}
          />
        )}

        {step === "webcam" && (
          <InfoStep
            title={i18n._(`Webcam Setup`)}
            subTitle={i18n._(`Make sure your webcam is working properly.`)}
            subComponent={
              <Stack
                sx={{
                  gap: "10px",
                  alignItems: "flex-start",
                }}
              >
                <Stack
                  sx={{
                    width: "350px",
                    height: "220px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    backgroundColor: "rgba(0, 0, 0, 0.2)",
                    borderRadius: "9px",
                    justifyContent: "center",
                    alignItems: "center",
                    margin: "20px 0",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {allowWebCam === true && <WebCamView />}
                  {allowWebCam === null && (
                    <Stack
                      sx={{
                        gap: "5px",
                        alignItems: "center",
                      }}
                    >
                      <Button
                        color="info"
                        variant="contained"
                        sx={{
                          padding: "10px 20px",
                        }}
                        onClick={() => setAllowWebCam(true)}
                        startIcon={<VideocamIcon />}
                      >
                        {i18n._(`Allow WebCam`)}
                      </Button>
                    </Stack>
                  )}
                </Stack>
              </Stack>
            }
            disabled={allowWebCam === null || loadingImageDescription}
            secondButtonTitle={i18n._(`Skip for now`)}
            onSecondButtonClick={
              allowWebCam == null
                ? () => {
                    setAllowWebCam(false);
                    onNext();
                  }
                : undefined
            }
            onClick={doneWebCamSetup}
          />
        )}

        {step === "words" && (
          <InfoStep
            title={i18n._(`Words to Learn`)}
            subTitle={i18n._(`Here are some new words for you to learn:`)}
            subComponent={
              <Stack
                sx={{
                  width: "100%",
                  flexDirection: "row",
                  gap: "0px 12px",
                  flexWrap: "wrap",
                  padding: "20px 0",
                }}
                className={isWordsLoading ? "loading-shimmer" : ""}
              >
                {wordsToLearn.map((word, index) => {
                  const isLastWord = index === wordsToLearn.length - 1;
                  return (
                    <Typography key={index} className="decor-text" variant="h3" align="center">
                      {word}
                      {!isLastWord ? "," : ""}
                    </Typography>
                  );
                })}
              </Stack>
            }
            disabled={isWordsLoading}
            onClick={onStart}
            secondButtonTitle={i18n._(`Refresh`)}
            secondButtonEndIcon={<RefreshCw size={"18px"} />}
            onSecondButtonClick={() => loadWords()}
          />
        )}

        {step === "start" && (
          <InfoStep
            title={
              isStarting || loadingImageDescription ? i18n._(`Loading`) : i18n._(`Start Lesson`)
            }
            subTitle={loadingImageDescription ? "" : i18n._(`We're ready to begin!`)}
            actionButtonTitle={i18n._(`Start Call`)}
            disabled={isStarting || loadingImageDescription}
            onClick={onStart}
          />
        )}
      </Stack>
    </CustomModal>
  );
};

/*
return (
    <CustomModal isOpen={true} onClose={() => onClose()}>
      <Stack
        sx={{
          width: "100%",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Stack
          sx={{
            alignItems: "center",
            width: "100%",

            img: {
              borderRadius: "100px",
              width: "100px",
              height: "100px",
            },
          }}
        >
          {icon}
        </Stack>
        <Stack
          sx={{
            alignItems: "center",
            width: "100%",
            paddingTop: "30px",
          }}
        >
          <Stack>
            <Typography
              align="center"
              variant="caption"
              sx={{
                color: `rgba(255, 255, 255, 0.5)`,
                textTransform: "uppercase",
              }}
            >
              {subTitle}
            </Typography>
            <Typography variant="h4" align="center" component="h2" className="decor-text">
              {title}
            </Typography>
            {description && (
              <Typography sx={{ paddingTop: "0px" }} align="center" variant="caption">
                {description}
              </Typography>
            )}
          </Stack>

          {allowWebCam !== false && (
            <Stack
              sx={{
                width: "350px",
                height: "220px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                backgroundColor: "rgba(0, 0, 0, 0.2)",
                borderRadius: "9px",
                justifyContent: "center",
                alignItems: "center",
                margin: "20px 0",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {allowWebCam === true && <WebCamView />}

              {allowWebCam === null && (
                <Stack
                  sx={{
                    gap: "5px",
                    alignItems: "center",
                  }}
                >
                  <Button
                    color="info"
                    variant="contained"
                    onClick={() => setAllowWebCam(true)}
                    startIcon={<VideocamIcon />}
                  >
                    {i18n._(`Allow WebCam`)}
                  </Button>
                  <Button variant="text" onClick={() => setAllowWebCam(false)}>
                    {i18n._(`Skip for now`)}
                  </Button>
                </Stack>
              )}
            </Stack>
          )}

          <Stack
            sx={{
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              margin: "5px 0px 15px 0px",
              gap: "10px",
              marginTop: allowWebCam !== false ? "5px" : "20px",
            }}
          >
            <Button
              sx={{
                minWidth: "240px",
                padding: "10px 20px",
              }}
              onClick={onStartCallMode}
              size="large"
              variant="contained"
              color="info"
              startIcon={isLoadingCall ? <Loader /> : <VideocamIcon />}
              disabled={isLoadingCall || isLoadingVoice || webcam.loading || allowWebCam === null}
            >
              {i18n._(`Start Call`)}
            </Button>

            <Button
              onClick={onStartVoiceOnly}
              variant="text"
              color="info"
              startIcon={isLoadingVoice ? <Loader /> : <MicIcon />}
              disabled={isLoadingCall || isLoadingVoice || webcam.loading || allowWebCam === null}
            >
              {i18n._(`Start Voice Only`)}
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </CustomModal>
    */
