'use client';
import { ChatMessage } from '@/common/conversation';
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
  getAuthToken,
  onMessageOrder,
  webCamDescription,
  generateTextWithAi,
  playAudio,
}: ConversationConfig): Promise<ConversationInstance> => {
  // State management
  const conversationHistory: ChatMessage[] = [];
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

  // Build system message from instruction parts
  const getSystemMessage = (): string => {
    if (instructionState.correction) {
      return instructionState.correction;
    }

    return (
      [
        instructionState.correction,
        instructionState.baseInitInstruction,
        instructionState.webCamDescription,
      ]
        .filter((part) => part && part.length > 0)
        .join('\n') + 'Res'
    );
  };

  // Convert conversation history to text format for AI
  const formatConversationHistory = (): string => {
    if (conversationHistory.length === 0) {
      return '';
    }

    return conversationHistory
      .map((msg) => {
        const role = msg.isBot ? 'Assistant' : 'User';
        return `${role}: ${msg.text}`;
      })
      .join('\n');
  };

  const cacheProcessing: Record<string, Promise<string> | undefined> = {};

  const generateResponseText = async (teacherMessage?: string): Promise<string> => {
    if (teacherMessage) {
      return fixOutputText(teacherMessage);
    }

    const systemMessage = getSystemMessage();
    const userMessage = formatConversationHistory();
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

      const botMessage: ChatMessage = {
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
      const errorBotMessage: ChatMessage = {
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

  const getLastMessage = (): ChatMessage | null => {
    if (conversationHistory.length === 0) {
      return null;
    }
    return conversationHistory[conversationHistory.length - 1];
  };

  // Add user message
  const addUserChatMessage = (message: string): void => {
    const userMessageId = generateMessageId();
    const previousMessageId = getLastMessage()?.id;

    const userMessage: ChatMessage = {
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
    console.log('Updating correction instruction:', correction);
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
    if (lastMessage && !lastMessage.isBot && lastMessage.isInProgress) {
      lastMessage.text = `${lastMessage.text} ${delta}`.trim();
      onMessage(lastMessage);
    } else {
      const previousMessageId = getLastMessage()?.id;
      const messageId = generateMessageId();
      const newMessage: ChatMessage = {
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

    generateResponseText();
  };

  const completeUserMessageDelta = () => {
    const lastMessage = conversationHistory[conversationHistory.length - 1];
    if (lastMessage && lastMessage.isInProgress) {
      lastMessage.isInProgress = false;
      onMessage(lastMessage);
    }
  };

  return {
    closeHandler,
    addUserChatMessage,
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
