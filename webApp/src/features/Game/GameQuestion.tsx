import { GameQuestionScreenProps } from './gameQuestionScreens/type';
import { DescribeImageScreen } from './gameQuestionScreens/ImageScreen';
import { WordScreen } from './gameQuestionScreens/WordScreen';
import { SentenceScreen } from './gameQuestionScreens/SentenceScreen';
import { TopicToDiscussScreen } from './gameQuestionScreens/TopicToDiscussScreen';
import { GameQuestionType } from './types';
import { ReadTextScreen } from './gameQuestionScreens/ReadTextScreen';
import { useGame } from './useGame';

const ScreenMap: Record<GameQuestionType, React.FC<GameQuestionScreenProps>> = {
  describe_image: DescribeImageScreen,
  translate: WordScreen,
  sentence: SentenceScreen,
  topic_to_discuss: TopicToDiscussScreen,
  read_text: ReadTextScreen,
};

export const GameQuestion = ({}: GameQuestionScreenProps) => {
  const game = useGame();

  if (!game.activeQuestion) return null;
  const ScreenComponent = ScreenMap[game.activeQuestion.type];
  return <ScreenComponent />;
};
