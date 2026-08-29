'use client';

import { useEffect, useRef } from 'react';
import { useAudioRecorder } from '@/features/Audio/useAudioRecorder';
import { SpeechAnswerPanelView } from './SpeechAnswerPanelView';
import { isLessonPartWithAnswer, LessonPartState } from './types';

export { SpeechAnswerPanelView } from './SpeechAnswerPanelView';
export type { SpeechAnswerPanelViewProps } from './SpeechAnswerPanelView';

export const SpeechAnswerPanel = ({
  part,
  partIndex,
  isEvaluating,
  onAudioReady,
  onSubmit,
}: {
  part: LessonPartState;
  partIndex: number;
  isEvaluating: boolean;
  onAudioReady: (blob: Blob) => void;
  onSubmit: (transcript: string, blob: Blob | null) => Promise<void>;
}) => {
  const recorder = useAudioRecorder();
  const submittedRef = useRef('');
  const cancelledRef = useRef(false);
  const needMoreText = !!recorder.transcription && recorder.transcription.trim().length < 4;

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
    if (text.length < 4) return;
    if (submittedRef.current === text) return;
    submittedRef.current = text;
    void onSubmit(text, recorder.transcriptionBlob).then(() => {
      recorder.removeTranscript();
    });
  }, [
    isEvaluating,
    onSubmit,
    recorder.isRecording,
    recorder.isTranscribing,
    recorder.removeTranscript,
    recorder.transcription,
    recorder.transcriptionBlob,
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
      onToggleRecord={() => {
        if (recorder.isRecording) {
          void recorder.stopRecording();
        } else {
          submittedRef.current = '';
          cancelledRef.current = false;
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
