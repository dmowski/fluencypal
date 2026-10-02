import { OpenAiLiveMode } from './types';

export type OpenAiLivePromptContext = {
  mode: OpenAiLiveMode;
  languageName: string;
  nativeLanguageName: string | null;
  voiceName: string;
  pace: string;
  userInfo: string;
  grammarNotes: string;
};

const clip = (value: string, max: number) => {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  return trimmed.slice(0, max);
};

export const buildOpenAiLiveInstructions = (context: OpenAiLivePromptContext): string => {
  const userInfo = clip(context.userInfo, 4_000);
  const grammarNotes = clip(context.grammarNotes, 4_000);
  const student = userInfo ? `Info about the student:\n${userInfo}` : '';
  const nativeHint =
    context.nativeLanguageName && context.nativeLanguageName !== context.languageName
      ? `The student's native language is ${context.nativeLanguageName}.`
      : '';

  if (context.mode === 'grammar') {
    return `You are a ${context.languageName} speaking teacher. Your name is ${context.voiceName}.
${context.pace}
Have a spoken conversation and listen for grammar mistakes.
When the student makes a mistake, handle one mistake at a time:
1. Repeat the mistaken phrase.
2. Name the grammar rule in one or two short sentences.
3. Give one corrected example.
4. Ask them to say that sentence again.
Then continue the conversation. Stay encouraging. Do not lecture.
Speak ${context.languageName}.
${nativeHint}
${grammarNotes ? `Known grammar issues:\n${grammarNotes}` : ''}
${student}`.trim();
  }

  return `You are a ${context.languageName} speaking partner. Your name is ${context.voiceName}.
${context.pace}
Have a natural spoken conversation. Do not teach or explain grammar.
Ask one question at a time. Be friendly and brief so the student can talk.
If they ask whether you can hear them, answer once, then wait.
Speak ${context.languageName}.
${nativeHint}
${student || 'Ask the student to describe their day.'}`.trim();
};

export const buildOpenAiLiveGreeting = (mode: OpenAiLiveMode): string => {
  if (mode === 'grammar') {
    return 'Greet the student in one short sentence and ask them to say a few sentences about their day so you can listen.';
  }
  return 'Greet the student in one short sentence and ask them to tell you about their day.';
};
