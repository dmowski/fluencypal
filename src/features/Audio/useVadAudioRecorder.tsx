'use client';
import { sendTranscriptRequest } from '@/app/api/transcript/sendTranscriptRequest';
import { useIsWebView } from '../Auth/useIsWebView';
import { useAuth } from '../Auth/useAuth';
import { useSettings } from '../Settings/useSettings';
import { useVadRecorder } from './useVadRecorder';
import { useState } from 'react';

export const useVadAudioRecorder = ({
  silenceMs,
  onTranscription,
  onTranscriptionStart,
}: {
  onTranscriptionStart: () => void;
  onTranscription: (transcript: string) => void;
  silenceMs?: number;
}) => {
  const auth = useAuth();
  const settings = useSettings();
  const learnLanguageCode = settings.languageCode || 'en';
  const [isTranscribing, setIsTranscribing] = useState(false);

  const getRecordTranscript = async (
    recordedAudioBlog: Blob,
    format: string,
    durationSeconds: number,
  ) => {
    if (format.includes('ogg')) {
      console.log('Skip because vad');
      return;
    }

    if (!recordedAudioBlog) {
      return;
    }

    onTranscriptionStart();

    const token = await auth.getToken();
    try {
      setIsTranscribing(true);
      const transcriptResponse = await sendTranscriptRequest({
        audioBlob: recordedAudioBlog,
        authKey: token,
        languageCode: learnLanguageCode,
        audioDuration: durationSeconds,
        format,
      });
      if (transcriptResponse.transcript) {
        onTranscription(transcriptResponse.transcript);
      }
      setIsTranscribing(false);
    } catch (error) {
      console.error('Transcription error:', error);
      setIsTranscribing(false);
    }
  };

  const [isEnabled, setIsEnabled] = useState(false);
  const recorderControls = useVadRecorder({
    onChunk: getRecordTranscript,
    silenceMs,
    onStop: () => setIsEnabled(false),
    onStart: () => setIsEnabled(true),
  });

  const { inWebView } = useIsWebView();

  return {
    isAbleToUse: !inWebView,
    isTranscribing,
    speakingLevel: recorderControls.inputLevel01,
    start: recorderControls.start,
    stop: recorderControls.stop,
    isRecording: recorderControls.isRunning,
    isSpeaking: recorderControls.isSpeaking,
    error: recorderControls.lastError,
    isEnabled,
  };
};
