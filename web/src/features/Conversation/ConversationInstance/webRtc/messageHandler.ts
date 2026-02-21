import { calculateUsagePrice, convertUsageUsdToBalanceHours, UsageEvent } from '@/common/ai';
import { ConversationConfig } from '../types';
import { EventHandlers, WebRtcState } from './types';

export const messageHandlerCreator = (state: WebRtcState, config: ConversationConfig) => {
  const messageHandler = (e: MessageEvent) => {
    const event = JSON.parse(e.data);
    const type = (event?.type || '') as string;
    // console.log('Event type:', type, '|', event);
    //console.log(JSON.stringify(event, null, 2));

    const previousItemId = event?.previous_item_id as string | undefined;
    const itemId = (event?.item_id || event.item?.id) as string | undefined;
    if (previousItemId && itemId) {
      config.onMessageOrder({
        [previousItemId]: itemId,
      });
    }

    if (type === 'response.done') {
      const usageId = event?.event_id || '';
      const usageEvent: UsageEvent | null = event?.response?.usage;
      if (usageEvent) {
        const priceUsd = calculateUsagePrice(usageEvent, config.model);
        const priceHours = convertUsageUsdToBalanceHours(priceUsd, config.userPricePerHourUsd);
        config.onAddUsage({
          usageId,
          usageEvent,
          priceUsd,
          priceHours,
          createdAt: Date.now(),
          model: config.model,
          languageCode: config.languageCode,
          type: 'realtime',
          conversationId: config.conversationId,
        });
      }
    }

    // conversation.item.input_audio_transcription.delta
    if (type === 'conversation.item.input_audio_transcription.delta') {
      const id = event?.item_id as string;
      const deltaMessage = event?.delta as string;
      if (id && deltaMessage) {
        const isBot = false;
        config.onAddDelta(id, deltaMessage, isBot);
      }
    }

    if (type === 'response.audio_transcript.delta') {
      const id = event?.item_id as string;
      const deltaMessage = event?.delta as string;
      if (id && deltaMessage) {
        const isBot = true;
        config.onAddDelta(id, deltaMessage, isBot);
      }
    }

    if (type === 'input_audio_buffer.speech_started') {
      config.setIsUserSpeaking(true);
    }

    if (type === 'input_audio_buffer.speech_stopped') {
      config.setIsUserSpeaking(false);
    }

    if (type === 'error') {
      console.error('Error in messageHandler', event);
    }

    if (type === 'conversation.item.input_audio_transcription.completed') {
      const userMessage = event?.transcript || '';
      if (userMessage) {
        const id = event?.item_id as string;
        config.onMessage({ isBot: false, text: userMessage, id });
        state.lastMessages.push({ isBot: false, text: userMessage });
      }
    }

    if (type === 'response.done') {
      const botAnswer = event?.response?.output
        .map((item: any) => {
          return (
            item?.content
              ?.map((content: any) => content?.transcript || content?.text || '')
              .join(' ')
              .trim() || ''
          );
        })
        .join(' ')
        .trim();

      const id = event?.response?.output?.[0]?.id as string | undefined;
      if (id && botAnswer) {
        config.onMessage({ isBot: true, text: botAnswer || '', id });
        state.lastMessages.push({ isBot: true, text: botAnswer });
      }
    }

    if (type === 'conversation.item.created') {
      if (
        event.item.role === 'user' &&
        event.item.status === 'completed' &&
        event.item.type === 'message'
      ) {
        const id = event.item.id as string;
        const content = event.item.content || [];
        const userMessage = content
          .map((item: any) => (item.type === 'input_text' ? item.text || '' : ''))
          .join(' ')
          .trim();

        if (userMessage && id) {
          config.onMessage({ isBot: false, text: userMessage, id });
          state.lastMessages.push({ isBot: false, text: userMessage });
        }
      }
    }
  };

  return messageHandler;
};
