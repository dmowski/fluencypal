'use client';

import { useAudioRecorder } from '@/features/Audio/useAudioRecorder';
import { SpeechAnswerPanelView } from './SpeechAnswerPanelView';
import { isLessonPartWithAnswer, LessonPartState } from './types';

export { SpeechAnswerPanelView } from './SpeechAnswerPanelView';
export type { SpeechAnswerPanelViewProps } from './SpeechAnswerPanelView';

export const SpeechAnswerPanel = ({
  part,
  partIndex,
  isEvaluating,
  onSubmit,
}: {
  part: LessonPartState;
  partIndex: number;
  isEvaluating: boolean;
  onSubmit: (transcript: string, blob: Blob | null) => Promise<void>;
}) => {
  const recorder = useAudioRecorder();
  const needMoreText = !!recorder.transcription && recorder.transcription.trim().length < 4;

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
          void recorder.startRecording();
        }
      }}
      onSubmit={() => {
        const transcript = recorder.transcription?.trim();
        if (!transcript) return;
        void onSubmit(transcript, recorder.transcriptionBlob).then(() => {
          recorder.removeTranscript();
        });
      }}
      onClear={() => {
        recorder.removeTranscript();
        void recorder.cancelRecording();
      }}
    />
  );
};
