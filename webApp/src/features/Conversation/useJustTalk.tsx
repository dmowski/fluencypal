import { useLingui } from '@lingui/react';
import { useSettings } from '../Settings/useSettings';
import { useAiConversation } from './useAiConversation/useAiConversation';
import { useState } from 'react';
import { useConversationAudio } from '../Audio/useConversationAudio';
import { getMediaAudioStreams, getMediaVideoStreams } from '../webCam/mediaStream';
import { RealTimeModel } from '../Ai/ai';

export const useJustTalk = () => {
  const { i18n } = useLingui();

  const settings = useSettings();

  const conversation = useAiConversation();
  const [isCallStarting, setIsCallStarting] = useState(false);
  const audio = useConversationAudio();
  const voiceName = settings.userSettings?.teacherVoice || 'shimmer';
  const startJustTalk = async (model?: RealTimeModel) => {
    if (isCallStarting) return;
    await audio.initAudio();
    setIsCallStarting(true);

    /*
    try {
      //audio.music.stop();
      //audio.music.setVolume(0.5);
      await sleep(150);
      //audio.music.play('/audio/call_start_01.mp3');
      await sleep(150);
      setTimeout(() => {
        //audio.music.setVolume(0);
      }, 10000);
    } catch (e) {
      console.error('Error playing call start music', e);
    }
    */

    try {
      const mediaStream = await getMediaAudioStreams();
      if (!mediaStream) {
        throw new Error('Could not access microphone');
      }

      //await sleep(100);
      await getMediaVideoStreams();
    } catch (e) {
      console.warn('Microphone permission denied. error', e);
      alert(
        i18n._(
          `Microphone access is required to start the call.
Please allow microphone permission in your browser settings, refresh the page, and try again.`,
        ),
      );
      // window.location.reload();
      setIsCallStarting(false);
      return;
    }

    //await sleep(500);

    await settings.setConversationMode('call');
    conversation.startConversation({
      conversationMode: 'call',
      mode: 'talk',
      voice: voiceName,
      model,
    });
  };

  return {
    startJustTalk,
    isCallStarting,
  };
};
