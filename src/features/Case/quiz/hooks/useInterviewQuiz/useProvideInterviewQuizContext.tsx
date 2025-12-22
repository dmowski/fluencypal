"use client";

import { useAuth } from "@/features/Auth/useAuth";
import { InterviewQuizContextType, InterviewQuizProps, QuizStep } from "./types";
import { getUrlStart } from "@/features/Lang/getUrlStart";
import { useQuizCore } from "../useQuizCore";
import { db } from "@/features/Firebase/firebaseDb";
import {
  AnalyzeInputsQuizStep,
  InterviewQuizAnswer,
  InterviewQuizResults,
  InterviewQuizSurvey,
  QuizAnswers,
  QuizOption,
  QuizResults,
} from "../../../types";
import { useQuizSurveyData } from "../useQuizSurveyData";
import { useEffect, useState } from "react";
import { initEmptyData } from "./data";
import { getHash } from "./hash";
import { useTextAi } from "@/features/Ai/useTextAi";
import { MODELS } from "@/common/ai";
import { useAnalytics } from "@/features/Analytics/useAnalytics";
import { ScorePreview } from "@/features/Case/Landing/components/ScorePreviewSection";
import { GoalPlan } from "@/features/Plan/types";
import { usePlan } from "@/features/Plan/usePlan";
import { useAiUserInfo } from "@/features/Ai/useAiUserInfo";
import { ChatMessage } from "@/common/conversation";
import { useSettings } from "@/features/Settings/useSettings";
import { useRouter } from "next/navigation";
import { sleep } from "@/libs/sleep";

export function useProvideInterviewQuizContext({
  coreData,
  quiz,
  lang,
  interviewId,
}: InterviewQuizProps): InterviewQuizContextType {
  const auth = useAuth();
  const mainPageUrl = getUrlStart(lang) + `case/${interviewId}`;
  const path: QuizStep[] = quiz.steps.map((step) => step.id);
  const ai = useTextAi();
  const plan = usePlan();

  const settings = useSettings();

  const userInfo = useAiUserInfo();
  const analytics = useAnalytics();
  const [isConfirmedGTag, setIsConfirmedGTag] = useState(false);

  const core = useQuizCore({
    path,
    mainPageUrl,
  });
  const data = useQuizSurveyData({
    surveyDocRef: db.documents.interviewQuizSurvey(auth.uid, interviewId),
    initEmptyData: initEmptyData,
  });

  const appMode = settings.userSettings?.appMode || null;

  useEffect(() => {
    if (
      settings.loading ||
      !auth.uid ||
      !settings.userSettings?.createdAt ||
      (appMode === "interview" && settings.conversationMode === "call")
    ) {
      return;
    }
    settings.setAppMode("interview");
    settings.setConversationMode("call");
  }, [settings.loading, appMode, auth.uid]);

  const currentStep = quiz.steps.find((step) => step.id === core.currentStepId) || null;

  const updateAnswerTranscription = async (
    survey: InterviewQuizSurvey,
    stepId: string,
    fullAnswerTranscription: string
  ): Promise<InterviewQuizSurvey> => {
    const answerData: InterviewQuizAnswer = {
      stepId,
      question: currentStep?.title || "",
      answer: fullAnswerTranscription,
    };

    const oldAnswers = survey.answers || {};
    const updatedSurvey: InterviewQuizSurvey = {
      ...survey,
      answers: {
        ...oldAnswers,
        [stepId]: answerData,
      },
    };

    return await data.updateSurvey(updatedSurvey, `Update answer transcription for step ${stepId}`);
  };

  const [isAnalyzingInputs, setIsAnalyzingInputs] = useState<Record<string, boolean>>({});
  const [isAnalyzingInputsError, setIsAnalyzingInputsError] = useState<Record<string, string>>({});

  const analyzeInputs = async ({
    step,
    answers,
    results,
  }: {
    step: AnalyzeInputsQuizStep;
    answers: QuizAnswers;
    results: QuizResults;
  }) => {
    const stepId = step.id;

    const isAnalyzing = isAnalyzingInputs[stepId];
    if (isAnalyzing) {
      return;
    }

    setIsAnalyzingInputs((prev) => ({ ...prev, [stepId]: true }));
    setIsAnalyzingInputsError((prev) => ({ ...prev, [stepId]: "" }));

    const currentStepIndex = quiz.steps.findIndex((s) => s.id === step.id);
    const previousSteps = quiz.steps.filter((step, index) => {
      return index < currentStepIndex && (step.type === "record-audio" || step.type === "options");
    });
    const previousStepsIdsToAnswer = previousSteps.map((s) => s.id);

    const userAnswersIds = Object.keys(answers);
    const goodAnswersIds = previousStepsIdsToAnswer.filter((answerStepId) => {
      return userAnswersIds.includes(answerStepId);
    });

    const inEnoughDataToAnalyze = goodAnswersIds.length === previousStepsIdsToAnswer.length;
    const survey = data.survey;
    if (!survey) {
      setIsAnalyzingInputsError((prev) => ({ ...prev, [stepId]: "Survey data is not loaded." }));
      setIsAnalyzingInputs((prev) => ({ ...prev, [stepId]: false }));
      return;
    }
    if (!inEnoughDataToAnalyze) {
      const errorMessage = "Not enough data to analyze inputs.";
      setIsAnalyzingInputsError((prev) => ({ ...prev, [stepId]: errorMessage }));
      setIsAnalyzingInputs((prev) => ({ ...prev, [stepId]: false }));
      return;
    }

    const combinedAnswers = goodAnswersIds
      .map((id) => {
        const questionStep = quiz.steps.find((step) => step.id === id);

        const questionTitle = questionStep ? questionStep.title : "Unknown question";
        const questionSubTitle = questionStep ? questionStep.subTitle : "";

        const questionHeader = `Question: ${questionTitle}\n${questionSubTitle}\nAnswer:`;
        const answer = answers[id]?.answer || "";
        return `${questionHeader}\n${answer}`;
      })
      .join("\n\n");

    const inputDataHash = getHash(combinedAnswers + step.aiSystemPrompt);
    const isAlreadyAnswered = inputDataHash === results[step.id]?.inputHash;
    if (isAlreadyAnswered) {
      setIsAnalyzingInputs((prev) => ({ ...prev, [stepId]: false }));
      setIsAnalyzingInputsError((prev) => ({ ...prev, [stepId]: "" }));
      return;
    }

    const stepSystemMessage = step.aiSystemPrompt || "";
    const systemMessageWrapper = "Return the response in Markdown format.";
    const systemMessage = `${stepSystemMessage}\n${systemMessageWrapper}`.trim();

    try {
      const outputFormat = step.aiResponseFormat;
      let markdownFeedback = "";
      let jsonScoreFeedback: ScorePreview | null = null;
      let practicePlan: GoalPlan | null = null;
      if (outputFormat === "markdown") {
        const response = await ai.generate({
          systemMessage,
          userMessage: combinedAnswers,
          model: MODELS.gpt_4o,
        });
        markdownFeedback = response.trim();
      }
      if (outputFormat === "json-scope") {
        const response = await ai.generateJson<ScorePreview>({
          systemMessage,
          userMessage: combinedAnswers,
          model: MODELS.gpt_4o,
          attempts: 3,
        });
        jsonScoreFeedback = response || null;
      }

      if (outputFormat === "practice-plan") {
        const conversationMessages: ChatMessage[] = goodAnswersIds
          .map((id) => {
            const questionStep = quiz.steps.find((step) => step.id === id);

            const questionTitle = questionStep ? questionStep.title : "Unknown question";
            const questionSubTitle = questionStep ? questionStep.subTitle : "";

            const question = `${questionTitle}\n${questionSubTitle}:`;
            const answer = answers[id]?.answer || "";

            return [
              { id: "", isBot: true, text: `${question}` },
              { id: "", isBot: false, text: `${answer}` },
            ];
          })
          .flat();

        const userRecords = await userInfo.extractUserRecords(conversationMessages, lang);
        const goal = await plan.generateGoal({
          languageCode: lang,
          conversationMessages: conversationMessages,
          userInfo: userRecords,
          aiSystemMessage: stepSystemMessage,
        });
        practicePlan = goal;
      }

      const result: InterviewQuizResults = {
        stepId,
        inputHash: inputDataHash,
        markdownFeedback,
        jsonScoreFeedback,
        practicePlan,
      };
      const oldResults = survey.results || {};
      const updatedSurvey: InterviewQuizSurvey = {
        ...survey,
        results: {
          ...oldResults,
          [stepId]: result,
        },
      };

      await data.updateSurvey(updatedSurvey, `Update analysis results for step ${stepId}`);
    } catch (error) {
      setIsAnalyzingInputsError((prev) => ({ ...prev, [stepId]: String(error) }));
    } finally {
      setIsAnalyzingInputs((prev) => ({ ...prev, [stepId]: false }));
    }
  };

  const quizAnswers = data.survey?.answers || null;
  const results = data.survey?.results || null;

  useEffect(() => {
    if (currentStep?.type === "analyze-inputs" && quizAnswers && results) {
      analyzeInputs({ step: currentStep, answers: quizAnswers, results });
    }
  }, [currentStep, quizAnswers, results]);

  const currentStepType = currentStep?.type || null;

  useEffect(() => {
    if (!analytics.isInitialized) {
      return;
    }

    if (isConfirmedGTag) {
      return;
    }
    const isDev = auth.userInfo?.email?.includes("dmowski") || false;
    if (isDev) {
      //return;
    }

    if (auth.uid && currentStepType === "done") {
      setTimeout(() => {
        // analytics.confirmGtag();
        console.log("GTag confirmed for interview quiz");
        setIsConfirmedGTag(true);
      }, 1000);
    }
  }, [isConfirmedGTag, auth.uid, analytics.isInitialized, currentStepType]);

  const getSelectedOptionsForStep = (stepId: string): QuizOption[] => {
    const answers = data.survey?.answers || {};
    const answer = answers[stepId];
    if (!answer) {
      return [];
    }

    const parsedAnswer = JSON.parse(answer.answer) as QuizOption[];
    return parsedAnswer;
  };

  const updateSelectedOptionsForStep = async (
    survey: InterviewQuizSurvey,
    stepId: string,
    selectedOptions: QuizOption[]
  ): Promise<InterviewQuizSurvey> => {
    const step = quiz.steps.find((s) => s.id === stepId);
    if (!step) {
      throw new Error(`Step with id ${stepId} not found`);
    }

    const answerData: InterviewQuizAnswer = {
      stepId,
      question: step.title || "",
      answer: JSON.stringify(selectedOptions),
    };

    const oldAnswers = survey.answers || {};
    const updatedSurvey: InterviewQuizSurvey = {
      ...survey,
      answers: {
        ...oldAnswers,
        [stepId]: answerData,
      },
    };

    return await data.updateSurvey(updatedSurvey, `Update selected options for step ${stepId}`);
  };

  const router = useRouter();

  const [isRedirectingToApp, setIsRedirectingToApp] = useState(false);
  const openApp = async () => {
    const answersKeys = Object.keys(data.survey?.results || {});
    const planData = answersKeys
      .map((key) => data.survey?.results?.[key]?.practicePlan)
      .filter(Boolean)?.[0];

    if (!planData) {
      alert(
        "No practice plan available to open the app. Try going back and re-generating the plan."
      );
      return;
    }
    setIsRedirectingToApp(true);
    await plan.addGoalPlan(planData);
    const appUrl = getUrlStart(lang) + "practice";
    router.push(appUrl);

    await sleep(2000);
    setIsRedirectingToApp(false);
  };

  return {
    ...core,
    openApp,
    survey: data.survey,
    currentStep,
    updateSurvey: data.updateSurvey,
    updateAnswerTranscription,
    isAnalyzingInputs,
    isAnalyzingInputsError,
    mainPageUrl,
    getSelectedOptionsForStep,
    updateSelectedOptionsForStep,
    isRedirecting: core.isNavigateToMainPage || isRedirectingToApp,
  };
}
