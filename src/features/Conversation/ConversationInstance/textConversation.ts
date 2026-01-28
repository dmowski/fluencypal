'use client';
import { ConversationMessage } from '@/common/conversation';
import { ConversationConfig, ConversationInstance } from './types';
import { getHash } from '@/libs/hash';

interface InstructionState {
  baseInitInstruction: string;
  webCamDescription: string;
  correction: string;
}

export const initTextConversation = async ({
  model,
  initInstruction,
  onMessage,
  onOpen,
  setIsUserSpeaking,
  isMuted,
  onAddDelta,
  onAddUsage,
  languageCode,
  voice,
  isVolumeOn,
  onMessageOrder,
  webCamDescription,
  generateTextWithAi,
  playAudio,
}: ConversationConfig): Promise<ConversationInstance> => {
  // State management
  const conversationHistory: ConversationMessage[] = [];
  let isProcessingAiResponse = false;

  const instructionState: InstructionState = {
    baseInitInstruction: initInstruction,
    webCamDescription: webCamDescription || '',
    correction: '',
  };

  const audioState = {
    isMuted: isMuted,
    isVolumeOn: isVolumeOn,
    lockVolume: false,
  };

  // Generate unique message ID
  const generateMessageId = (): string => {
    return `${Date.now()}`;
  };

  // --- Progressive summary config ---
  const SUMMARY_CHUNK_SIZE = 8;
  const SUMMARY_KEEP_LAST = 4;

  // Cache for chunk summaries (separate from response cacheProcessing)
  const summaryCache: Record<string, Promise<string> | undefined> = {};

  const summarySystemMessage = `You are an AI assistant that summarizes conversations between a teacher and a student.
Your task is to create a shorter version of conversation.
Format the summary as explicit facts: what user and teacher said.`;

  // Build system message from instruction parts
  const getSystemMessage = (): string => {
    if (instructionState.correction) {
      return instructionState.correction;
    }

    const combinedPrompt = [
      instructionState.correction,
      instructionState.baseInitInstruction,
      instructionState.webCamDescription,
    ]
      .filter((part) => part && part.length > 0)
      .join('\n');
    return (combinedPrompt + ' Do not use emojis in your responses.').trim();
  };

  const formatConversationHistoryAsync = async (): Promise<string> => {
    if (conversationHistory.length === 0) return '';

    const messages = conversationHistory;
    const total = messages.length;

    const summarizeCount = Math.max(0, total - SUMMARY_KEEP_LAST);
    const chunkCount = Math.floor(summarizeCount / SUMMARY_CHUNK_SIZE);

    const roleLabel = (msg: ConversationMessage) => (msg.isBot ? 'Assistant' : 'User');

    const formatRangeAsText = (start: number, endExclusive: number) => {
      return messages
        .slice(start, endExclusive)
        .map((msg) => `${roleLabel(msg)}: ${msg.text}`)
        .join('\n');
    };

    const summarizeChunk = (chunkText: string): Promise<string> => {
      const key = getHash(chunkText);

      if (!summaryCache[key]) {
        const userMessage = `Please provide a concise summary of the following conversation chunk:\n\n${chunkText}`;
        console.log('Generate summary', { userMessage });
        summaryCache[key] = generateTextWithAi({
          systemMessage: summarySystemMessage,
          userMessage: userMessage,
        }).then((raw) => raw.trim());
      }

      return summaryCache[key]!;
    };

    // If no full chunks, return everything verbatim
    if (chunkCount === 0) {
      return messages.map((msg) => `${roleLabel(msg)}: ${msg.text}`).join('\n');
    }

    // Summarize full chunks progressively
    const summaries: string[] = [];
    for (let chunkIndex = 0; chunkIndex < chunkCount; chunkIndex++) {
      const start = chunkIndex * SUMMARY_CHUNK_SIZE;
      const end = start + SUMMARY_CHUNK_SIZE;

      const chunkText = formatRangeAsText(start, end);
      const s = await summarizeChunk(chunkText);

      // Keep it compact; you can change formatting if you want
      summaries.push(`- Messages ${start + 1}-${end}: ${s}`);
    }

    const summarizedUntil = chunkCount * SUMMARY_CHUNK_SIZE; // exclusive
    const remainingVerbatimText = formatRangeAsText(summarizedUntil, total);

    const summaryBlock = summaries.join('\n');

    return [
      `Summary of earlier conversation:\n${summaryBlock}`,
      `\nConversation (latest messages verbatim):\n${remainingVerbatimText}`,
    ].join('\n');
  };

  const cacheProcessing: Record<string, Promise<string> | undefined> = {};

  const generateResponseText = async (teacherMessage?: string): Promise<string> => {
    if (teacherMessage) {
      return fixOutputText(teacherMessage);
    }

    const systemMessage = getSystemMessage();
    const userMessage = await formatConversationHistoryAsync();
    const cacheKey = getHash(systemMessage + '\n' + userMessage);

    const aiResponseRawCached = cacheProcessing[cacheKey];

    const aiResponseRequest =
      aiResponseRawCached ||
      generateTextWithAi({
        systemMessage,
        userMessage,
      });

    if (!aiResponseRawCached) {
      cacheProcessing[cacheKey] = aiResponseRequest;
    }

    const aiResponseProcessed = fixOutputText(await aiResponseRequest);
    return aiResponseProcessed;
  };

  // Trigger AI response
  const triggerAiResponse = async (teacherMessage?: string): Promise<void> => {
    if (isProcessingAiResponse) {
      console.log('AI response already in progress, skipping trigger');
      return;
    }

    const previousMessageStart = getLastMessage();
    const previousMessageStartId = previousMessageStart ? previousMessageStart.id : null;

    if (previousMessageStart?.isBot) {
      console.log('Previous message is from bot, skipping AI response trigger');
      return;
    }

    const responseToStart = previousMessageStart ? previousMessageStart.text : '';

    isProcessingAiResponse = true;

    const botMessageId = generateMessageId();

    try {
      const aiResponse = await generateResponseText(teacherMessage);

      const previousMessageLatest = getLastMessage();
      const previousMessageText = previousMessageLatest ? previousMessageLatest.text : '';
      if (previousMessageText !== responseToStart) {
        console.log(
          'Conversation changed during AI response generation, Triggering new AI response.',
          {
            before: responseToStart,
            after: previousMessageText,
          },
        );
        isProcessingAiResponse = false;
        return triggerAiResponse(teacherMessage);
      }

      const botMessage: ConversationMessage = {
        id: botMessageId,
        isBot: true,
        text: aiResponse,
        previousId: previousMessageStartId,
      };
      conversationHistory.push(botMessage);

      // Update message ordering
      if (previousMessageStartId) {
        onMessageOrder({
          [previousMessageStartId]: botMessageId,
        });
      }

      // Notify about new message
      onMessage(botMessage);

      if (voice && audioState.isVolumeOn) {
        const instruction = previousMessageStart?.text
          ? `Please read the following text aloud in response to: "${previousMessageStart.text}"`
          : 'Please read the following text aloud:';
        playAudio(aiResponse, voice, instruction);
      }
    } catch (error: any) {
      console.error('Error generating AI response:', error);

      const errorMessage = `Error: ${error.message || 'Unknown error occurred'}`;
      const errorBotMessage: ConversationMessage = {
        id: botMessageId,
        isBot: true,
        text: errorMessage,
        previousId: previousMessageStartId,
      };

      conversationHistory.push(errorBotMessage);

      if (previousMessageStartId) {
        onMessageOrder({
          [previousMessageStartId]: botMessageId,
        });
      }

      onMessage(errorBotMessage);
    } finally {
      isProcessingAiResponse = false;
    }
  };

  const getLastMessage = (): ConversationMessage | null => {
    if (conversationHistory.length === 0) {
      return null;
    }
    return conversationHistory[conversationHistory.length - 1];
  };

  // Add user message
  const addThreadsMessage = (message: string): void => {
    const userMessageId = generateMessageId();
    const previousMessageId = getLastMessage()?.id;

    const userMessage: ConversationMessage = {
      id: userMessageId,
      isBot: false,
      text: message,
      previousId: previousMessageId,
    };

    conversationHistory.push(userMessage);

    // Update message ordering
    if (previousMessageId) {
      onMessageOrder({
        [previousMessageId]: userMessageId,
      });
    }

    // Notify about new message
    onMessage(userMessage);
  };

  const fixOutputText = (text: string): string => {
    let fixedText = text.trim();

    // Remove leading "Assistant:" or "Shimmer:" if present
    if (fixedText.startsWith('Assistant:')) {
      fixedText = fixedText.replace('Assistant:', '').trim();
    }

    if (fixedText.startsWith('Shimmer:')) {
      fixedText = fixedText.replace('Shimmer:', '').trim();
    }

    if (voice && fixedText.toLowerCase().startsWith(voice.toLowerCase() + ':')) {
      fixedText = fixedText.replace(voice + ':', '').trim();
    }

    return fixedText.trim();
  };

  // Send correction instruction
  const sendCorrectionInstruction = async (correction: string): Promise<void> => {
    //console.log('Updating correction instruction:', correction);
    // instructionState.correction = correction;
    if (correction) {
      triggerAiResponse(fixOutputText(correction));
    }
  };

  // Send webcam description
  const sendWebCamDescription = async (description: string): Promise<void> => {
    const isCorrectionExists = Boolean(instructionState.correction);
    if (isCorrectionExists) {
      console.log('Ignoring webcam description update due to existing correction.');
      return;
    }
    //console.log("Updating webcam description:", description);
    instructionState.webCamDescription = description;
  };

  // Cleanup handler
  const closeHandler = (): void => {
    console.log('Closing text conversation');
    conversationHistory.length = 0;
    isProcessingAiResponse = false;
  };

  // No-op implementations for audio-related functions
  const toggleMute = (mute: boolean): void => {
    audioState.isMuted = mute;
  };

  const toggleVolume = (isVolumeOn: boolean): void => {
    if (audioState.lockVolume) {
      return;
    }

    audioState.isVolumeOn = isVolumeOn;
  };

  const lockVolume = (): void => {
    audioState.lockVolume = true;
  };

  const unlockVolume = (): void => {
    audioState.lockVolume = false;
  };

  setTimeout(() => {
    onOpen();
  }, 10);

  const addUserMessageDelta = (delta: string) => {
    const lastMessage = conversationHistory[conversationHistory.length - 1];
    let userMessage = '';
    if (lastMessage && !lastMessage.isBot && lastMessage.isInProgress) {
      lastMessage.text = `${lastMessage.text} ${delta}`.trim();
      userMessage = lastMessage.text;
      onMessage(lastMessage);
    } else {
      const previousMessageId = getLastMessage()?.id;
      const messageId = generateMessageId();
      userMessage = delta;
      const newMessage: ConversationMessage = {
        isBot: false,
        text: delta,
        id: messageId,
        isInProgress: true,
        previousId: previousMessageId,
      };
      if (previousMessageId) {
        onMessageOrder({
          [previousMessageId]: messageId,
        });
      }
      conversationHistory.push(newMessage);
      onMessage(newMessage);
    }

    if (userMessage.trim().length === 0) {
      return;
    }
    generateResponseText();
  };

  const completeUserMessageDelta = ({ removeMessage = false }: { removeMessage?: boolean }) => {
    if (removeMessage) {
      const lastMessage = conversationHistory[conversationHistory.length - 1];
      if (lastMessage && !lastMessage.isBot && lastMessage.isInProgress) {
        lastMessage.text = ' ';
        onMessage(lastMessage);
      }
      return;
    }
    const lastMessage = conversationHistory[conversationHistory.length - 1];
    if (lastMessage && lastMessage.isInProgress) {
      lastMessage.isInProgress = false;
      onMessage(lastMessage);
    }
  };

  return {
    closeHandler,
    addThreadsMessage,
    triggerAiResponse,
    toggleMute,
    toggleVolume,
    sendWebCamDescription,
    sendCorrectionInstruction,
    addUserMessageDelta,
    completeUserMessageDelta,
    lockVolume,
    unlockVolume,
  };
};
