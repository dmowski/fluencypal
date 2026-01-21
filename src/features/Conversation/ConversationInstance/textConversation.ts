'use client';
import { ChatMessage } from '@/common/conversation';
import { ConversationConfig, ConversationInstance } from './types';

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

    return [
      instructionState.correction,
      instructionState.baseInitInstruction,
      instructionState.webCamDescription,
    ]
      .filter((part) => part && part.length > 0)
      .join('\n');
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

  // Trigger AI response
  const triggerAiResponse = async (teacherMessage?: string): Promise<void> => {
    if (isProcessingAiResponse) {
      console.log('AI response already in progress, skipping trigger');
      return;
    }

    const previousMessage =
      conversationHistory.length > 0 ? conversationHistory[conversationHistory.length - 1] : null;
    const previousMessageId = previousMessage ? previousMessage?.id : null;

    if (previousMessage?.isBot) {
      console.log('Previous message is from bot, skipping AI response trigger');
      return;
    }

    isProcessingAiResponse = true;

    const botMessageId = generateMessageId();

    try {
      const systemMessage = getSystemMessage();
      const userMessage = formatConversationHistory();

      // console.log("System message:", systemMessage);
      // console.log('Conversation history:', userMessage);

      onAddDelta(botMessageId, '...', true);

      const aiResponse =
        teacherMessage ||
        (await generateTextWithAi({
          systemMessage,
          userMessage,
        }));

      const botMessage: ChatMessage = {
        id: botMessageId,
        isBot: true,
        text: aiResponse,
        previousId: previousMessageId,
      };

      conversationHistory.push(botMessage);

      // Update message ordering
      if (previousMessageId) {
        onMessageOrder({
          [previousMessageId]: botMessageId,
        });
      }

      // Notify about new message
      onMessage(botMessage);

      if (voice && audioState.isVolumeOn) {
        const instruction = previousMessage?.text
          ? `Please read the following text aloud in response to: "${previousMessage.text}"`
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
        previousId: previousMessageId,
      };

      conversationHistory.push(errorBotMessage);

      if (previousMessageId) {
        onMessageOrder({
          [previousMessageId]: botMessageId,
        });
      }

      onMessage(errorBotMessage);
    } finally {
      isProcessingAiResponse = false;
    }
  };

  const getLastMessageId = (): string | null => {
    if (conversationHistory.length === 0) {
      return null;
    }
    return conversationHistory[conversationHistory.length - 1].id;
  };

  // Add user message
  const addUserChatMessage = (message: string): void => {
    const userMessageId = generateMessageId();
    const previousMessageId = getLastMessageId();

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

  // Send correction instruction
  const sendCorrectionInstruction = async (correction: string): Promise<void> => {
    console.log('Updating correction instruction:', correction);
    // instructionState.correction = correction;
    if (correction) {
      if (correction.startsWith('Assistant:')) {
        correction = correction.replace('Assistant:', '').trim();
      }
      triggerAiResponse(correction);
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
      const previousMessageId = getLastMessageId();
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
  };

  const completeUserMessageDelta = () => {
    const lastMessage = conversationHistory[conversationHistory.length - 1];
    console.log('completeUserMessageDelta', lastMessage);
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
