import { MIN_USEFUL_CONTEXT_MESSAGES } from './constants';
import { LessonGenerationContext } from './types';

const lessonShape = `Return JSON:
{
  "title": "3-5 words that name the language point, not the topic",
  "subTitle": "5-7 words: the form they must use",
  "parts": [
    { "contentMD": "markdown the learner reads", "type": "read" | "speech" }
  ]
}`;

const lessonDesignRules = `Design a 10-15 minute speaking lesson around ONE specific, checkable language point.

This product already trains speaking clearly. Do NOT make the lesson about
clarity, fluency, confidence, "talking better", "presenting clearly",
"sounding natural", or "explaining your project". Those are the course, not today.

The focus must be a form the learner can reuse in a sentence, for example:
- articles: a demo video / the landing page
- a tense or aspect: I'm recording vs I recorded
- a chunk: the reign of X; so that; used to
- a contrast they mix up: try to vs I'm [doing]
- countable/uncountable, prepositions, word order, one word family

Title and first read part must name that form. Bad: "Talk about your project clearly".
Good: "Articles with unique nouns" / "Use **the** with one specific thing".

Typical flow:
- Read: the one rule, with 2-4 real example phrases (bold the target form)
- Read: a short text that uses the form several times
- Speech: say a sentence that MUST include the form
- Speech: fix or contrast a wrong version
- Speech: translate a native sentence that forces the form
- Speech: finish a starter that already contains the form

Every speech task should make it obvious whether they used the form.
Keep speech prompts doable in 15-40 seconds.
Write learner-facing content in the TARGET language unless translating FROM native
(then put the source sentence in the native language).
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
Pick ONE language form they actually used wrong or avoided. Build the whole lesson around that form.
Do not write a vague communication tip. Topics (demo, project, history) are only the example world.

Recent conversation (most recent first, up to 30 messages; older chats included if the latest one was short):
${context.conversationText}

${hasGoal ? `Learner goal / notes:\n${context.userGoalText}` : ''}`;
  }

  if (hasGoal) {
    return `The learner has little or no recent conversation history.
Create a lesson from their goal and notes. Pick ONE concrete language form they will need for that goal.
Do not teach "speak clearly" or "present better". Aim at a useful next form, not a review of unknown mistakes.

Learner goal / notes:
${context.userGoalText}`;
  }

  return `The learner has no conversation history and no saved goal.
Create a solid middle-level (CEFR B1) lesson for the target language around ONE form
(e.g. past simple + time phrase, or a/the with unique nouns): short rule, example text, then voice tasks that force that form.`;
};

export const buildNextLessonUserPrompt = (context: LessonGenerationContext): string => {
  return `Create the next lesson based on what the learner just practiced and how they did.
Move one step forward to a NEW specific form (or a tighter version of the weakest form).
Do not repeat a vague "speak clearly / present better" lesson.

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
Write very short feedback the learner will read.
Rules:
- 1-2 short sentences. No greeting, no recap of the full answer.
- If it is right, say so in a few words.
- If it is wrong, name only the main issue and give the better wording.
- Markdown is allowed: bold the key phrase or correction.
Use the target language if the learner is intermediate+, otherwise mix target + a short native-language hint.
Return JSON: { "aiResultToUser": "short markdown, 1-2 sentences" }`;
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
