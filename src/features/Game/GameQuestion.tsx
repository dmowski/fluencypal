import { GameQuestionScreenProps } from "./gameQuestionScreens/type";
import { DescribeImageScreen } from "./gameQuestionScreens/DescribeImageScreen";
import { WordScreen } from "./gameQuestionScreens/WordScreen";
import { SentenceScreen } from "./gameQuestionScreens/SentenceScreen";

export const GameQuestion = ({ question, onSubmitAnswer, onNext }: GameQuestionScreenProps) => {
  if (question.type === "describe_image") {
    return (
      <DescribeImageScreen question={question} onSubmitAnswer={onSubmitAnswer} onNext={onNext} />
    );
  }

  if (question.type === "translate") {
    return <WordScreen question={question} onSubmitAnswer={onSubmitAnswer} onNext={onNext} />;
  }

  if (question.type === "sentence") {
    return <SentenceScreen question={question} onSubmitAnswer={onSubmitAnswer} onNext={onNext} />;
  }

  return <></>;
};
