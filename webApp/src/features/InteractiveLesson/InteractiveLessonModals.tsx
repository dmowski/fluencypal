'use client';

import { InteractiveLessonModal } from './InteractiveLessonModal';
import { LessonProgressModal } from './LessonProgressModal';
import { useInteractiveLesson } from './useInteractiveLesson';

export const InteractiveLessonModals = () => {
  const lesson = useInteractiveLesson();

  return (
    <>
      <InteractiveLessonModal
        isOpen={lesson.isOpen && lesson.isUserReady}
        onClose={lesson.closeLesson}
        lesson={lesson.currentLesson}
        needsLanguageSetup={lesson.needsLanguageSetup}
        nativeLanguageCode={lesson.nativeLanguageCode}
        targetLanguageCode={lesson.targetLanguageCode}
        isStoreReady={lesson.isStoreReady}
        isGeneratingLesson={lesson.isGeneratingLesson}
        isGeneratingNext={lesson.isGeneratingNext}
        isGeneratingResults={lesson.isGeneratingResults}
        evaluatingPartIndex={lesson.evaluatingPartIndex}
        errorMessage={lesson.errorMessage}
        onEnsureLesson={lesson.ensureCurrentLesson}
        onChangeNative={(code) => {
          void lesson.setNativeLanguage(code);
        }}
        onChangeTarget={(code) => {
          void lesson.setLanguage(code);
        }}
        onPrepareSpeechAudio={lesson.prepareSpeechAudio}
        onSubmitSpeech={lesson.submitSpeechAnswer}
        onFinishLesson={lesson.finishCurrentLesson}
        onSkipLesson={lesson.skipCurrentLesson}
        onNextLesson={lesson.goToNextLesson}
      />

      <LessonProgressModal
        isOpen={lesson.isProgressOpen && lesson.isUserReady}
        onClose={lesson.closeProgress}
        audioProgress={lesson.audioProgress}
        lessons={lesson.history}
      />
    </>
  );
};
