import { MIN_USEFUL_CONTEXT_MESSAGES } from './constants';
import { LessonGenerationContext } from './types';

const lessonShape = `Return JSON:
{
  "title": "3-5 words that name the language point, not the topic",
  "subTitle": "5-7 words: the form they must use",
  "parts": [
    { "type": "read" | "speech", "contentMD": "markdown the learner reads or reads aloud" }
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
- FIRST part (required): type "read". Teach HOW to use the form in real speech.
  Write 4-5 short paragraphs (not 1-2). Simple words. Each paragraph 2-4 sentences.
  Cover: what the form does, when to use it, when not to, then 3-5 real example
  phrases with the form in **bold**. Walk through at least one example like a
  teacher: "If you say X, it means … If you say Y, it means …".
  You MAY add a short native-language gloss or comparison when it makes the rule
  clearer (one line or a short sentence, not a full translation of the lesson).
  Most of the text stays in the TARGET language.
- SECOND part (required): type "speech". A longer text the learner must READ ALOUD
  (4-5 short paragraphs, about 15-22 sentences / 200-320 words — not 2 short
  paragraphs). A small story or everyday scene that uses the form many times.
  Keep the whole part under 3500 characters so playback still works.
  Start with one line: tell them to read the text aloud. Then the text itself.
  No question, no "say one sentence of your own" here.
- Then more speech: invite them to use the form (they may add extra sentences);
  fix or contrast a wrong version; translate a native sentence that needs the form.
- LAST part (required): an open talk. type must be "speech". Ask them to speak
  for 2-3 minutes on a concrete, everyday or slightly random topic (a recent day,
  a person, a place, a plan, a story). One inviting question, not a quiz item,
  not "use this form in one sentence". The goal is a long sample of their real
  language so later lessons have mistakes and gaps to teach from.

Form-check speech prompts stay short (15-40 seconds) and invite the form.
Do not write "only one sentence" or "nothing else" — extra talk is welcome.
The last part is the only long free-talk. The second part is read-aloud, not free talk.
Write learner-facing content in the TARGET language unless a native-language hint
helps the rule, or you are translating FROM native (then put the source sentence
in the native language).
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

const bannedRecentFormsBlock = (context: LessonGenerationContext): string => {
  return `Do NOT repeat a recent form or a close variant. If they just did present continuous / -ing,
do not teach "this week I'm ...-ing" or any other -ing lesson. Change category
(articles, past simple, used to, so that, prepositions, countable, word order, comparatives).
A tighter version of the same form still counts as a repeat.

Already covered (banned):
${context.recentFormsSummary || 'None listed.'}`;
};

export const buildFirstLessonUserPrompt = (context: LessonGenerationContext): string => {
  const hasConversation = context.conversationMessageCount >= MIN_USEFUL_CONTEXT_MESSAGES;
  const hasGoal = !!context.userGoalText.trim();
  const banned = bannedRecentFormsBlock(context);

  if (hasConversation) {
    return `Create the learner's next lesson from their recent conversations.
Pick ONE language form they actually used wrong or avoided. Build the whole lesson around that form.
Do not write a vague communication tip. Topics (demo, project, history) are only the example world.
The last part must be a 2-3 minute open talk on a fresh topic.

${banned}

Recent conversation (most recent first, up to 30 messages; older chats included if the latest one was short):
${context.conversationText}

${hasGoal ? `Learner goal / notes:\n${context.userGoalText}` : ''}`;
  }

  if (hasGoal) {
    return `The learner has little or no recent conversation history.
Create a lesson from their goal and notes. Pick ONE concrete language form they will need for that goal.
Do not teach "speak clearly" or "present better". Aim at a useful next form, not a review of unknown mistakes.
The last part must be a 2-3 minute open talk on a fresh topic.

${banned}

Learner goal / notes:
${context.userGoalText}`;
  }

  return `The learner has no conversation history and no saved goal.
Create a solid middle-level (CEFR B1) lesson for the target language around ONE form
(e.g. past simple + time phrase, or a/the with unique nouns): a 4-5 paragraph how-to
explanation, a longer 4-5 paragraph text to read aloud, then voice tasks that force that form.
The last part must be a 2-3 minute open talk on a simple everyday topic.

${banned}`;
};

export const buildNextLessonUserPrompt = (context: LessonGenerationContext): string => {
  return `Create the next lesson from the learner's language, not from a quiz checklist.

The 2-3 minute open talks are the main evidence. Short form-check answers are too thin
to find what to teach next. Read the open talks first. Pick ONE specific form they
used wrongly, avoided, or overused there. Build the whole lesson around that form.
Do not invent a new "speak clearly" lesson.

${bannedRecentFormsBlock(context)}

Open talks (most recent first):
${context.openTalkSummary || 'No open talks yet. Use the short answers and results below.'}

Previous lesson results and short answers:
${context.previousLessonsSummary || 'No previous results.'}

The last part of THIS lesson must again be a new 2-3 minute open talk on a different topic.`;
};

export const buildSpeechFeedbackSystemPrompt = (params: {
  targetLanguageName: string;
  nativeLanguageName: string;
  isOpenTalk?: boolean;
  isReadAloud?: boolean;
}): string => {
  if (params.isOpenTalk) {
    return `You react to a 2-3 minute open talk in a language lesson.
Target language: ${params.targetLanguageName}.
Native language: ${params.nativeLanguageName}.
This is not a quiz item. Do not check one required form.
Write short feedback the learner will read.
Rules:
- 2-4 short sentences. No greeting, no recap of the whole talk.
- Name 1-2 specific language forms they struggled with or avoided (article, tense, chunk, preposition).
- Give one better wording for the main issue.
- Markdown is allowed: bold the key phrase or correction.
Use the target language if the learner is intermediate+, otherwise mix target + a short native-language hint.
Return JSON: { "aiResultToUser": "short markdown, 2-4 sentences" }`;
  }

  if (params.isReadAloud) {
    return `You check a read-aloud in a language lesson.
Target language: ${params.targetLanguageName}.
Native language: ${params.nativeLanguageName}.
The learner had to read the given text aloud, not invent a new answer.
Write short feedback the learner will read.
Rules:
- 1-3 short sentences. No greeting, no recap of the whole passage.
- If they read most of the text, treat it as done. Small slips are OK.
- Comment on whether they said the target form clearly. Bold one good phrase.
- If they skipped a large part of the text, ask them to read the full passage.
- Do NOT mark it wrong because they did not add extra sentences of their own.
Use the target language if the learner is intermediate+, otherwise mix target + a short native-language hint.
Return JSON: { "aiResultToUser": "short markdown, 1-3 sentences" }`;
  }

  return `You check one spoken answer in a language lesson.
Target language: ${params.targetLanguageName}.
Native language: ${params.nativeLanguageName}.
Write very short feedback the learner will read.

Judge the language, not obedience to the prompt format.
- Extra sentences, extra context, and improvisation are welcome.
- Do NOT mark it wrong because they said more than asked, or did not use only one sentence.
- If they used the target form (or a natural equivalent) correctly, say it is correct. Mention a small polish only if it helps.
- Mark it wrong only for a real language mistake (wrong form, missing form, broken grammar that changes meaning).
- Never punish them for sounding human.

Rules:
- 1-2 short sentences. No greeting, no recap of the full answer.
- If it is right, say so in a few words and bold the good phrase.
- If it is wrong, name only the main language issue and give the better wording.
- Markdown is allowed: bold the key phrase or correction.
Use the target language if the learner is intermediate+, otherwise mix target + a short native-language hint.
Return JSON: { "aiResultToUser": "short markdown, 1-2 sentences" }`;
};

export const buildSpeechFeedbackUserPrompt = (params: {
  partContentMD: string;
  userVoiceTranscript: string;
  isReadAloud?: boolean;
}): string => {
  if (params.isReadAloud) {
    return `The learner was asked to read this text aloud:
${params.partContentMD}

Transcript of what they said:
${params.userVoiceTranscript}

Compare the transcript to the passage. They should read it, not invent a new answer.`;
  }

  return `Task shown to the learner:
${params.partContentMD}

Transcript of what they said:
${params.userVoiceTranscript}

Accept extra talk around the form. Only judge whether the language is good.`;
};

export const buildLessonResultsSystemPrompt = (params: { targetLanguageName: string }): string => {
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
