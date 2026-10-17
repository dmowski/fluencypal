'use client';

import { useEffect, useState } from 'react';
import { useAudioRecorder } from '@/features/Audio/useAudioRecorder';
import { useCorrections } from '@/features/Corrections/useCorrections';

export const useVoiceTake = () => {
  const recorder = useAudioRecorder();
  const corrections = useCorrections();
  const [corrected, setCorrected] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const transcript = recorder.transcription || '';

  useEffect(() => {
    if (!transcript.trim()) {
      setCorrected('');
      setSuggestion('');
      return;
    }
    let cancelled = false;
    void corrections
      .analyzeUserMessage({
        previousBotMessage: '',
        message: transcript,
        conversationId: 'voice-room',
      })
      .then((result) => {
        if (cancelled) return;
        setCorrected(result.correctedMessage || transcript);
        setSuggestion(result.description || '');
      });
    return () => {
      cancelled = true;
    };
  }, [transcript]);

  return {
    recorder,
    transcript,
    corrected,
    suggestion,
    durationSec: Math.max(1, Math.round((recorder.recordingMilliSeconds || 0) / 1000)),
  };
};
