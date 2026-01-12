"use client";
import { Button, Stack, Typography } from "@mui/material";
import { Check, RefreshCw } from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { useLingui } from "@lingui/react";
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
import { ConversationMode } from "@/common/user";
import { ConversationType } from "@/common/conversation";
import { Markdown } from "../uiKit/Markdown/Markdown";
import { useTranslate } from "../Translation/useTranslate";
import { ConversationIdea, useAiUserInfo } from "../Ai/useAiUserInfo";
import { useTextAi } from "../Ai/useTextAi";
import { LoadingShapes } from "../uiKit/Loading/LoadingShapes";
import { LessonPlan, LessonPlanStep } from "../LessonPlan/type";
import { useLessonPlan } from "../LessonPlan/useLessonPlan";

type Step = "intro" | "mic" | "webcam" | "words" | "rules" | "start" | "plan";

const elementSteps: Record<PlanElementMode, Step[]> = {
  conversation: ["intro", "mic", "webcam", "plan", "start"],
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
  onClose,
  goalInfo,
}: {
  onClose: () => void;
  goalInfo: GoalElementInfo;
}) => {
  const { i18n } = useLingui();
  const webcam = useWebCam();
  const settings = useSettings();
  const words = useWords();
  const rules = useRules();
  const aiConversation = useAiConversation();
  const aiUserInfo = useAiUserInfo();
  const ai = useTextAi();

  const lessonPlan = useLessonPlan();

  const [allowWebCam, setAllowWebCam] = useState<boolean | null>(null);
  const conversationMode = conversationModes[goalInfo.goalElement.mode];

  const conversationType = conversationTypes[goalInfo.goalElement.mode];

  const steps: Step[] = elementSteps[goalInfo.goalElement.mode];
  const [step, setStep] = useState<Step>(steps[0]);

  const [isMicAllowed, setIsMicAllowed] = useState<boolean | null>(null);

  const [wordsToLearn, setWordsToLearn] = useState<string[]>([]);
  const [isWordsLoading, setIsWordsLoading] = useState<boolean>(false);
  const wordsLoadingRef = useRef(isWordsLoading);
  const translator = useTranslate();

  const [isLessonPlanLoading, setIsLessonPlanLoading] = useState<boolean>(false);
  const isLoadingLessonPlanRef = useRef(false);

  const loadLessonPlan = async (skipCache?: boolean) => {
    isLoadingLessonPlanRef.current = true;
    setIsLessonPlanLoading(true);

    await lessonPlan.createLessonPlan(goalInfo, skipCache);

    isLoadingLessonPlanRef.current = false;
    setIsLessonPlanLoading(false);
  };

  const loadWords = async (knownWords?: string[]) => {
    setIsWordsLoading(true);
    wordsLoadingRef.current = true;
    const wordsList = await words.getNewWordsToLearn(goalInfo, knownWords || []);

    setWordsToLearn(wordsList);
    setIsWordsLoading(false);
    wordsLoadingRef.current = false;
  };

  const refreshWords = () => {
    loadWords(wordsToLearn);
  };

  const [ruleToLearn, setRuleToLearn] = useState<string>("");
  const [isRuleLoading, setIsRuleLoading] = useState<boolean>(false);
  const isRuleLoadingRef = useRef(isRuleLoading);
  const loadRule = async () => {
    setIsRuleLoading(true);
    isRuleLoadingRef.current = true;
    const rule = await rules.getRules(goalInfo);
    setRuleToLearn(rule);
    setIsRuleLoading(false);
    isRuleLoadingRef.current = false;
  };

  const [ideas, setIdeas] = useState<ConversationIdea>();
  const isLoadingIdeasRef = useRef(false);

  const loadIdeas = async () => {
    isLoadingIdeasRef.current = true;
    const goalTitle = goalInfo.goalPlan.title || "";
    const elementTitle = goalInfo.goalElement.title || "";
    const elementDescription = goalInfo.goalElement.description || "";
    const goalInfoString = `${goalTitle} - ${elementTitle} - ${elementDescription}`;
    const result = await aiUserInfo.generateFirstMessageText(goalInfoString);
    setIdeas(result);
    isLoadingIdeasRef.current = false;
  };

  useEffect(() => {
    if (steps.includes("words") && !wordsLoadingRef.current) loadWords();
    if (steps.includes("rules") && !isRuleLoadingRef.current) loadRule();
    if (!isLoadingIdeasRef.current) loadIdeas();
    if (steps.includes("plan") && !isLoadingLessonPlanRef.current) loadLessonPlan();
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
      wordsToLearn,
      ruleToLearn,
      ideas: ideas || undefined,
      lessonPlan: lessonPlan.activeLessonPlan || undefined,
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
        {translator.translateModal}

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
            onClick={onNext}
            secondButtonTitle={i18n._(`I know these`)}
            secondButtonDisabled={isWordsLoading}
            secondButtonEndIcon={<RefreshCw size={"18px"} />}
            onSecondButtonClick={() => refreshWords()}
          />
        )}

        {step === "rules" && (
          <InfoStep
            title={i18n._(`Rules to Learn`)}
            subTitle={i18n._(`Here are some new rules for you to learn:`)}
            subComponent={
              <Stack
                sx={{
                  width: "100%",
                  flexDirection: "row",
                  gap: "0px 12px",
                  flexWrap: "wrap",
                  padding: "20px 0",
                }}
                className={isRuleLoading ? "loading-shimmer" : ""}
              >
                <Markdown
                  onWordClick={
                    translator.isTranslateAvailable
                      ? (word, element) => translator.translateWithModal(word, element)
                      : undefined
                  }
                  variant="conversation"
                >
                  {ruleToLearn || i18n._(`Loading...`)}
                </Markdown>
              </Stack>
            }
            disabled={isRuleLoading}
            onClick={onNext}
            secondButtonTitle={i18n._(`Refresh`)}
            secondButtonDisabled={isRuleLoading}
            secondButtonEndIcon={<RefreshCw size={"18px"} />}
            onSecondButtonClick={() => loadRule()}
          />
        )}

        {step === "plan" && (
          <InfoStep
            title={i18n._(`Lesson Plan`)}
            subTitle={i18n._(`Here is the lesson plan for this session:`)}
            subComponent={
              <Stack
                sx={{
                  width: "100%",
                  flexDirection: "row",
                  gap: "30px",
                  flexWrap: "wrap",
                  padding: "20px 0",
                }}
              >
                {(!lessonPlan.activeLessonPlan ||
                  lessonPlan.activeLessonPlan.steps.length === 0) && (
                  <Stack
                    sx={{
                      width: "100%",
                    }}
                  >
                    <LoadingShapes
                      sizes={["20px", "100px", "20px", "100px", "20px", "100px", "20px", "100px"]}
                    />
                  </Stack>
                )}

                {lessonPlan.activeLessonPlan?.steps.map((planStep, index) => (
                  <Stack
                    key={index}
                    className={isLessonPlanLoading ? "loading-shimmer" : ""}
                    sx={{
                      width: "100%",
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      {index + 1}. {planStep.stepTitle}
                    </Typography>
                    <Typography sx={{ marginTop: "5px" }}>
                      {planStep.stepDescriptionForStudent}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            }
            disabled={isLessonPlanLoading}
            onClick={onNext}
            secondButtonDisabled={isLessonPlanLoading}
            secondButtonTitle={i18n._(`Refresh`)}
            secondButtonEndIcon={<RefreshCw size={"18px"} />}
            onSecondButtonClick={() => loadLessonPlan(true)}
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
