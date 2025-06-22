import { GameQuestionScreenProps } from "./gameQuestionScreens/type";
import { DescribeImageScreen } from "./gameQuestionScreens/ImageScreen";
import { WordScreen } from "./gameQuestionScreens/WordScreen";
import { SentenceScreen } from "./gameQuestionScreens/SentenceScreen";
import { TopicToDiscussScreen } from "./gameQuestionScreens/TopicToDiscussScreen";

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

  if (question.type === "topic_to_discuss") {
    return (
      <TopicToDiscussScreen question={question} onSubmitAnswer={onSubmitAnswer} onNext={onNext} />
    );
  }

  return <></>;
};
