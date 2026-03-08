import { useEffect, useMemo, useState } from 'react';
import { createSeededRandom } from './createSeededRandom';
import {
  constructFinalProgress,
  generateRandomWordOptions,
  getActiveSentencePart,
} from './textConstructor.utils';

type UseTextConstructorFlowParams = {
  sentences: string[];
  sentencesTranslates: string[];
  progress: string;
  numberOfOptions: number;
  keyboardShortcutsEnabled?: boolean;
  onContinue: (progress: string) => void;
  onComplete?: () => void;
  onPlayAudio?: (audioText: string, alternativeVoice: boolean) => void;
  onSentenceComplete?: (sentenceIndex: number) => void;
  onActiveWordsChange?: (activeWords: string[]) => void;
  onGoodWord?: (word: string) => void;
  onBadWord?: (word: string) => void;
  onCorrectWordAvailable?: (word: string) => void;
};

export const useTextConstructorFlow = ({
  sentences,
  sentencesTranslates,
  progress,
  numberOfOptions,
  keyboardShortcutsEnabled = true,
  onContinue,
  onComplete,
  onPlayAudio,
  onSentenceComplete,
  onActiveWordsChange,
  onGoodWord,
  onBadWord,
  onCorrectWordAvailable,
}: UseTextConstructorFlowParams) => {
  const [wrongWord, setWrongWord] = useState<string | null>(null);

  const activePart = useMemo(() => {
    return getActiveSentencePart({ sentences, sentencesTranslates, progress });
  }, [sentences, sentencesTranslates, progress]);

  const options = useMemo(() => {
    if (!activePart) {
      return [];
    }

    const random = createSeededRandom(
      `${activePart.sentenceIndex}:${activePart.completedWordsInSentence}:${progress}`,
    );

    return generateRandomWordOptions({
      activeSentenceWords: activePart.activeSentenceWords,
      completedWordsInSentence: activePart.completedWordsInSentence,
      correctWord: activePart.nextWord,
      optionsCount: numberOfOptions,
      random,
    });
  }, [activePart, numberOfOptions, progress]);

  useEffect(() => {
    if (!wrongWord) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setWrongWord(null);
    }, 1000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [wrongWord]);

  const handlePick = (word: string) => {
    if (!activePart) {
      return;
    }

    if (word !== activePart.nextWord) {
      setWrongWord(word);
      onBadWord?.(word);
      return;
    }

    setWrongWord(null);

    onPlayAudio?.(word, false);
    onGoodWord?.(word);

    const nextProgress = constructFinalProgress({
      progress,
      nextWord: word,
    });

    onContinue(nextProgress);
  };

  useEffect(() => {
    if (!keyboardShortcutsEnabled) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isCtrlOrMetaPressed = event.ctrlKey || event.metaKey;

      if (isCtrlOrMetaPressed) {
        return;
      }

      const isEditableTarget =
        target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;

      if (isEditableTarget) {
        return;
      }

      const keyToOptionIndex: Record<string, number> = {
        '1': 0,
        '2': 1,
        '3': 2,
        '4': 3,
      };

      const optionIndex = keyToOptionIndex[event.key];

      if (optionIndex === undefined) {
        return;
      }

      const selectedWord = options[optionIndex];

      if (!selectedWord) {
        return;
      }

      event.preventDefault();
      handlePick(selectedWord);
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [keyboardShortcutsEnabled, options, handlePick]);

  useEffect(() => {
    if (!activePart) {
      onComplete?.();
      return;
    }
  }, [activePart, onComplete]);

  useEffect(() => {
    if (!activePart || activePart.sentenceIndex === 0) {
      return;
    }

    onSentenceComplete?.(activePart.sentenceIndex);
  }, [activePart, onSentenceComplete]);

  useEffect(() => {
    if (!activePart || !activePart.activeSentenceWords.length) {
      return;
    }

    onActiveWordsChange?.(activePart.activeSentenceWords);
  }, [activePart, onActiveWordsChange]);

  useEffect(() => {
    if (!activePart?.nextWord) {
      return;
    }

    onCorrectWordAvailable?.(activePart.nextWord);
  }, [activePart, onCorrectWordAvailable]);

  return {
    activePart,
    options,
    wrongWord,
    handlePick,
  };
};
