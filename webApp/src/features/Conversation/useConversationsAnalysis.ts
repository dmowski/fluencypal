import { useMemo, useState } from 'react';
import { useAiConversation } from './useAiConversation/useAiConversation';
import { usePlan } from '../Plan/usePlan';
import { useSettings } from '../Settings/useSettings';
import { useTextAi } from '../Ai/useTextAi';
import * as Sentry from '@sentry/nextjs';
import { useAuth } from '../Auth/useAuth';
import { useAiUserInfo } from '../User/useAiUserInfo';
import { useNotifications } from '@toolpad/core/useNotifications';
import { useLingui } from '@lingui/react';
import { fullLanguageName, getPageLangCode, SupportedLanguage } from '../Lang/lang';
import { increaseGamePointsRequest } from '../Game/gameBackendRequests';
import { ConversationResult } from '../Plan/types';
import { useLessonPlan } from '../LessonPlan/useLessonPlan';

export const useConversationsAnalysis = () => {
  const plan = usePlan();
  const aiConversation = useAiConversation();
  const textAi = useTextAi();
  const settings = useSettings();
  const userInfo = useAiUserInfo();
  const auth = useAuth();
  const notifications = useNotifications();
  const { i18n } = useLingui();
  const lessonPlan = useLessonPlan();

  const learningLanguage = settings.languageCode || 'en';

  const pageLangCode = useMemo(() => getPageLangCode(), []);
  const nativeLanguageCode =
    pageLangCode !== learningLanguage ? pageLangCode : settings.userSettings?.nativeLanguageCode;
  const fullNativeLanguage = nativeLanguageCode
    ? fullLanguageName[nativeLanguageCode as SupportedLanguage] || nativeLanguageCode
    : nativeLanguageCode;

  const [conversationAnalysisMap, setConversationAnalysisMap] = useState<
    Record<string, ConversationResult | null>
  >({});

  const [gamePointsEarnMap, setGamePointsEarnMap] = useState<Record<string, number>>({});

  const activeConversationId = aiConversation.conversationId || '';
  const conversationAnalysis = conversationAnalysisMap[activeConversationId] || null;
  const gamePointsEarned = gamePointsEarnMap[activeConversationId] || 0;

  const analyzeConversation = async () => {
    if (conversationAnalysis) {
      return;
    }

    if (!conversationAnalysis) {
      const usersMessages = aiConversation.conversation.filter((msg) => !msg.isBot);
      if (usersMessages.length > 3) {
        const pointsEarned = usersMessages.length;
        setGamePointsEarnMap((prev) => {
          const newMap = { ...prev, [activeConversationId]: pointsEarned };
          return newMap;
        });

        await increaseGamePointsRequest(
          {
            aiConversationId: activeConversationId,
            aiConversationPoints: pointsEarned,
            aiConversationUserId: auth.uid || '',
          },
          await auth.getToken(),
        );
      }
    }

    const messages = aiConversation.conversation;

    const messagesString = messages
      .map((message) => {
        const author = message.isBot ? 'AI' : 'User';
        return `${author}: ${message.text}`;
      })
      .join('\n');

    const goalElement = aiConversation.goalInfo?.goalElement;

    const goalElementId = goalElement?.id;
    const goalElementDescription = goalElementId
      ? `Lesson: ${goalElement.title} - ${goalElement.description} - ${goalElement.details}`
      : '';

    const systemMessage = `You are a language teacher giving feedback directly to the learner.
You are analyzing the conversation between the learner and the AI teacher.
The learner is learning ${settings.fullLanguageName}.

Write every feedback field in second person, addressing the learner as "You" / "your".
Never refer to the learner as "the user", "the student", or in third person.

Use the "${fullNativeLanguage}" language for analysis.

The learner has the following goal: ${aiConversation.goalInfo?.goalPlan.title}.

The learner is using the following lesson: ${goalElementDescription}.

${lessonPlan.activeLessonPlan ? `Lesson plan: ${JSON.stringify(lessonPlan.activeLessonPlan)}` : ''}

Answer in the following format (Results object in JSON):
{
shortSummaryOfLesson: string;

whatUserDidWell: string;
whatUserCanImprove: string;

whatToFocusOnNextTime: string;

phrasesToRemember: string;
}

Field style examples (second person only):
- whatUserDidWell: "You communicated several connected ideas clearly."
- whatUserCanImprove: "You can pause less between sentences next time."
- whatToFocusOnNextTime: "You should practice expanding short answers with one concrete example."
- shortSummaryOfLesson: "You practiced answering interview questions with confidence."
- phrasesToRemember: "- fine _with_ me\\n- it's up _to_ you\\n- look _forward_ to\\n- interested _in_ this\\n- responsible _for_ it"

phrasesToRemember rules:
- Exactly 5 markdown list items, one collocation per line.
- Write the phrases in ${settings.fullLanguageName} (the language being learned), not the native language.
- Prefer corrections of the learner's real mistakes (e.g. they said "fine for me" → "fine _with_ me").
- If there are fewer than 5 mistakes, fill remaining lines with useful collocations from this conversation.
- Keep each line short (about 2–6 words). No numbering, no extra commentary.
- Italic only the key/corrected word with markdown underscores so it is memorable.

Use ${settings.fullLanguageName} language for all answers.
Your output must be in valid JSON format with no additional text or explanation.
Your response will be parsed using JSON.parse().
`;
    try {
      console.log('Lesson review', systemMessage, messagesString);
      const aiResults = await textAi.generateJson<ConversationResult>({
        systemMessage,
        userMessage: messagesString,
        model: 'gpt-5.6-luna',
        languageCode: settings.languageCode || 'en',
      });

      if (goalElementId) {
        plan.finishGoalElement(goalElementId, aiResults);
      }

      setConversationAnalysisMap((prev) => {
        const newMap = { ...prev, [activeConversationId]: aiResults };
        return newMap;
      });
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          userId: auth.uid,
          userInfo: userInfo.userInfo,
          conversationMessages: messages,
        },
      });

      notifications.show(i18n._(`Error analyzing conversation`) + '=' + error, {
        severity: 'error',
      });
      console.error(error);
      throw error;
    }
  };

  const generateNextUserMessage = async () => {
    const messages = aiConversation.conversation;
    const messagesString = messages
      .map((message) => {
        const author = message.isBot ? 'AI' : 'User';
        return `${author}: ${message.text}`;
      })
      .join('\n');

    const systemMessage = `You are a language teacher and helper.
You are analyzing the conversation between the user and AI.
The user is learning ${settings.fullLanguageName}.

Your goal is to generate potential user's answer to last "AI" message. User is struggling with answering it.

Provide only potential answer, without any kind of wrapper/started/intro words. Just return answer. Generate one sentence
`;

    try {
      const aiResults = await textAi.generate({
        systemMessage,
        userMessage: messagesString,
        model: 'gpt-5.6-luna',
        languageCode: settings.languageCode || 'en',
      });
      return aiResults;
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          userId: auth.uid,
          userInfo: userInfo.userInfo,
          conversationMessages: messages,
        },
      });

      notifications.show(i18n._(`Error analyzing conversation`) + '=' + error, {
        severity: 'error',
      });

      return 'Error. Try one more time';
    }
  };

  return {
    conversationAnalysis,
    analyzeConversation,
    generateNextUserMessage,
    gamePointsEarned,
  };
};
