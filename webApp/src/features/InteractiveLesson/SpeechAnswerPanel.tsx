'use client';

import { useEffect, useRef, useState } from 'react';
import { useAudioRecorder } from '@/features/Audio/useAudioRecorder';
import { useConversationAudio } from '@/features/Audio/useConversationAudio';
import { SpeechAnswerPanelView } from './SpeechAnswerPanelView';
import { OPEN_TALK_MIN_CHARS } from './constants';
import { isLessonPartWithAnswer, LessonPartState } from './types';

export { SpeechAnswerPanelView } from './SpeechAnswerPanelView';
export type { SpeechAnswerPanelViewProps } from './SpeechAnswerPanelView';

export const SpeechAnswerPanel = ({
  part,
  partIndex,
  isEvaluating,
  isOpenTalk = false,
  onAudioReady,
  onSubmit,
}: {
  part: LessonPartState;
  partIndex: number;
  isEvaluating: boolean;
  isOpenTalk?: boolean;
  onAudioReady: (blob: Blob) => void;
  onSubmit: (transcript: string, blob: Blob | null) => Promise<void>;
}) => {
  const recorder = useAudioRecorder();
  const conversationAudio = useConversationAudio();
  const submittedRef = useRef('');
  const cancelledRef = useRef(false);
  const [autoPlayFeedback, setAutoPlayFeedback] = useState(false);
  const minChars = isOpenTalk ? OPEN_TALK_MIN_CHARS : 4;
  const needMoreText = !!recorder.transcription && recorder.transcription.trim().length < minChars;

  useEffect(() => {
    if (!recorder.recordedBlob || recorder.isRecording) return;
    if (cancelledRef.current) {
      cancelledRef.current = false;
      return;
    }
    onAudioReady(recorder.recordedBlob);
  }, [onAudioReady, recorder.isRecording, recorder.recordedBlob]);

  useEffect(() => {
    const text = recorder.transcription?.trim() || '';
    if (recorder.isRecording || recorder.isTranscribing || isEvaluating) return;
    if (text.length < minChars) return;
    if (submittedRef.current === text) return;
    submittedRef.current = text;
    setAutoPlayFeedback(false);
    void onSubmit(text, recorder.transcriptionBlob).then(() => {
      recorder.removeTranscript();
      setAutoPlayFeedback(true);
    });
  }, [
    isEvaluating,
    onSubmit,
    recorder.isRecording,
    recorder.isTranscribing,
    recorder.removeTranscript,
    recorder.transcription,
    recorder.transcriptionBlob,
    minChars,
  ]);

  return (
    <SpeechAnswerPanelView
      part={part}
      partIndex={partIndex}
      audioUrl={isLessonPartWithAnswer(part) ? part.userAudioUrl : undefined}
      previewBlob={recorder.transcriptionBlob}
      isEvaluating={isEvaluating}
      isRecording={recorder.isRecording}
      isTranscribing={recorder.isTranscribing}
      transcription={recorder.transcription}
      error={recorder.error}
      visualizer={recorder.visualizerComponent}
      needMoreText={needMoreText}
      isOpenTalk={isOpenTalk}
      autoPlayFeedback={autoPlayFeedback}
      onToggleRecord={() => {
        void conversationAudio.initAudio();
        if (recorder.isRecording) {
          void recorder.stopRecording();
        } else {
          submittedRef.current = '';
          cancelledRef.current = false;
          setAutoPlayFeedback(false);
          void recorder.startRecording();
        }
      }}
      onCancelRecord={() => {
        cancelledRef.current = true;
        void recorder.cancelRecording();
      }}
    />
  );
};
