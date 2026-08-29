import { MIN_USEFUL_CONTEXT_MESSAGES } from './constants';
import { LessonGenerationContext } from './types';

const lessonShape = `Return JSON:
{
  "title": "3-5 words",
  "subTitle": "5-7 words",
  "parts": [
    { "contentMD": "markdown the learner reads", "type": "read" | "speech" }
  ]
}`;

const lessonDesignRules = `Design a 10-15 minute speaking lesson.
Mix "read" parts (rule, short text, example) and "speech" parts (learner answers by voice).
Typical flow:
- Read a rule
- Read a short text that uses the rule
- Speech: explain a word meaning
- Speech: answer a question about the rule
- Speech: translate from native to target
- Speech: translate from target to native
- Speech: finish a sentence or share a short thought

Write learner-facing content in the TARGET language unless the task is a translation FROM the native language (then put the source sentence in the native language and ask them to speak the target version).
Keep "read" parts useful and concrete. Keep "speech" prompts short and doable in 15-40 seconds.
Do not mention that you are an AI or that this is JSON.`;

export const buildLessonSystemPrompt = (params: {
  targetLanguageName: string;
  nativeLanguageName: string;
}): string => {
  return `You create daily interactive speaking lessons for a language learner.
Target language: ${params.targetLanguageName}.
Native language: ${params.nativeLanguageName}.
${lessonDesignRules}
${lessonShape}`;
};

export const buildFirstLessonUserPrompt = (context: LessonGenerationContext): string => {
  const hasConversation = context.conversationMessageCount >= MIN_USEFUL_CONTEXT_MESSAGES;
  const hasGoal = !!context.userGoalText.trim();

  if (hasConversation) {
    return `Create the learner's next lesson from their recent conversations.
Personalize the rule and speaking tasks to mistakes, topics, and vocabulary you can infer.

Recent conversation (most recent first, up to 30 messages; older chats included if the latest one was short):
${context.conversationText}

${hasGoal ? `Learner goal / notes:\n${context.userGoalText}` : ''}`;
  }

  if (hasGoal) {
    return `The learner has little or no recent conversation history.
Create a lesson from their goal and notes. Aim at a useful next step, not a review of unknown mistakes.

Learner goal / notes:
${context.userGoalText}`;
  }

  return `The learner has no conversation history and no saved goal.
Create a solid middle-level (CEFR B1) lesson for the target language: one practical speaking rule, a short readable example, then several voice tasks.`;
};

export const buildNextLessonUserPrompt = (context: LessonGenerationContext): string => {
  return `Create the next lesson based on what the learner just practiced and how they did.
Move one step forward: keep what they did well, and target the weakest pattern.

Previous lesson results and answers:
${context.previousLessonsSummary || 'No previous results.'}`;
};

export const buildSpeechFeedbackSystemPrompt = (params: {
  targetLanguageName: string;
  nativeLanguageName: string;
}): string => {
  return `You check one spoken answer in a language lesson.
Target language: ${params.targetLanguageName}.
Native language: ${params.nativeLanguageName}.
Write the feedback the learner will read. Be specific: say if the answer is correct, what was good, and how to fix the main issue.
Use the target language if the learner is intermediate+, otherwise mix target + a short native-language hint.
Return JSON: { "aiResultToUser": "markdown, 2-5 short sentences" }`;
};

export const buildSpeechFeedbackUserPrompt = (params: {
  partContentMD: string;
  userVoiceTranscript: string;
}): string => {
  return `Task shown to the learner:
${params.partContentMD}

Transcript of what they said:
${params.userVoiceTranscript}`;
};

export const buildLessonResultsSystemPrompt = (params: {
  targetLanguageName: string;
}): string => {
  return `You write a short closing for one completed speaking lesson.
Language for the text: ${params.targetLanguageName} (keep it readable).
Return JSON:
{
  "motivationTextToUserMD": "warm, specific encouragement; 2-4 sentences; markdown",
  "whatWentWellMD": "what they did well AND the next step; 3-6 sentences; markdown"
}
Do not invent answers they did not give. If they skipped speaking tasks, mention that gently and suggest doing them next time.`;
};

export const buildLessonResultsUserPrompt = (params: {
  title: string;
  answersText: string;
}): string => {
  return `Lesson: ${params.title}

${params.answersText}`;
};
