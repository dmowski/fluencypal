import { Divider, Stack } from '@mui/material';
import { type ComponentProps, type ReactNode } from 'react';
import { BrowserAppShell } from '@/test-utils/browserAppShell';
import { ConversationCanvas } from './ConversationCanvas';
import { ConversationMessage } from '@/features/Conversation/conversation';
import { GuessGameStat } from './types';
import { CONVERSATION_DONE_MESSAGE_COUNT } from '@/features/Conversation/conversationProgress';

const BOT_OPENING =
  'Welcome to the job interview role-play. Tell me about yourself and why you want this role.';

const BOT_FOLLOWUP =
  'That is a strong start. Can you share an example of a challenge you solved at work?';

export function buildRolePlayConversation(userMessageCount: number): ConversationMessage[] {
  const messages: ConversationMessage[] = [{ id: 'bot-0', isBot: true, text: BOT_OPENING }];

  for (let index = 0; index < userMessageCount; index += 1) {
    messages.push({
      id: `user-${index}`,
      isBot: false,
      text: `I have ${index + 1} years of experience building web applications and I am excited about this opportunity.`,
    });

    if (index < userMessageCount - 1) {
      messages.push({
        id: `bot-${index + 1}`,
        isBot: true,
        text: BOT_FOLLOWUP,
      });
    }
  }

  return messages;
}

export const FIXTURE_ALIAS_GAME_WORDS: GuessGameStat = {
  wordsUserToDescribe: ['Dog', 'Cat', 'Elephant', 'Metal', 'Wood', 'Plastic', 'Paper', 'Rock'],
  wordsAiToDescribe: ['polite', 'sunny'],
};

export const FIXTURE_GOAL_TALK_CONVERSATION: ConversationMessage[] = [
  {
    id: 'bot-0',
    isBot: true,
    text: 'Hello! What would you like to practice today? Pick a topic or just start speaking.',
  },
];

const recordVisualizerComponent = (
  <Stack
    sx={{
      width: '150px',
      height: '40px',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Divider sx={{ width: '100%', borderColor: 'rgba(255,255,255,0.35)' }} />
  </Stack>
);

export const DEFAULT_CONVERSATION_CANVAS_PROPS: ComponentProps<typeof ConversationCanvas> = {
  conversation: FIXTURE_GOAL_TALK_CONVERSATION,
  isAiSpeaking: false,
  gameWords: null,
  isClosed: false,
  isClosing: false,
  addUserMessage: async () => undefined,
  balanceHours: 0.2,
  recordingError: '',
  togglePaymentModal: () => undefined,
  closeConversation: () => undefined,
  transcriptMessage: '',
  transcriptionBlob: null,
  startRecording: async () => undefined,
  stopRecording: async () => undefined,
  cancelRecording: async () => undefined,
  isTranscribing: false,
  isRecording: false,
  recordingMilliSeconds: 12_000,
  recordVisualizerComponent,
  isMuted: true,
  setIsMuted: () => undefined,
  isShowMessageProgress: true,
  conversationAnalysisResult: {
    whatToFocusOnNextTime: 'Use more concrete examples from your experience.',
    whatUserDidWell: 'You spoke clearly and stayed on topic.',
    shortSummaryOfLesson: 'You practiced answering interview questions with confidence.',
    whatUserCanImprove: 'Try expanding answers with one specific example each time.',
  },
  analyzeConversation: async () => undefined,
  toggleConversationMode: () => undefined,
  conversationMode: 'record',
  voice: 'ash',
  messageOrder: {},
  onWebCamDescription: () => undefined,
  isVolumeOn: true,
  setIsVolumeOn: () => undefined,
  isLimitedVoice: false,
  onLimitedClick: () => undefined,
  pointsEarned: 12,
  openCommunityPage: () => undefined,
  openNextLesson: () => undefined,
  addTranscriptDelta: () => undefined,
  completeUserMessageDelta: async () => undefined,
  recordingVoiceMode: 'RealTimeConversation',
  isSendMessagesBlocked: false,
};

export function ConversationCanvasFixture({
  children,
  ...overrides
}: Partial<ComponentProps<typeof ConversationCanvas>> & { children?: ReactNode }) {
  return (
    <BrowserAppShell>
      <ConversationCanvas {...DEFAULT_CONVERSATION_CANVAS_PROPS} {...overrides} />
      {children}
    </BrowserAppShell>
  );
}

export const ROLE_PLAY_EARLY_HINT_USER_MESSAGES = 2;
/** User turns that yield `CONVERSATION_DONE_MESSAGE_COUNT` total messages (bot + user). */
export const ROLE_PLAY_FINISH_READY_USER_MESSAGES = Math.ceil(CONVERSATION_DONE_MESSAGE_COUNT / 2);
