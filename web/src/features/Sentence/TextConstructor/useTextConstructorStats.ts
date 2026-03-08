import { useMemo } from 'react';
import { useGame } from '../../Game/useGame';
import type { ActiveSentencePart } from './textConstructor.utils';

export const useTextConstructorStats = ({
  activePart,
  sentences,
}: {
  activePart: ActiveSentencePart | null;
  sentences: string[];
}) => {
  const game = useGame();

  const progressPercent = useMemo(() => {
    if (!activePart) {
      return 100;
    }

    const totalLetters = sentences.reduce((sum, sentence) => sum + sentence.length, 0);

    if (totalLetters === 0) {
      return 100;
    }

    const completedLetters = sentences
      .slice(0, activePart.sentenceIndex)
      .reduce((sum, sentence) => sum + sentence.length, 0);
    const completedWordsInCurrentSentence = activePart.activeSentenceWords
      .slice(0, activePart.completedWordsInSentence)
      .join('').length;

    return Math.round(((completedLetters + completedWordsInCurrentSentence) / totalLetters) * 100);
  }, [activePart, sentences]);

  return {
    progressPercent,
    myPoints: game.myPoints || 0,
    myPosition: game.myPosition || 0,
  };
};
