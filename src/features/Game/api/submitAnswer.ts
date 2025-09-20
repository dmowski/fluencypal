import { GameUsersPoints, SubmitAnswerRequest, SubmitAnswerResponse } from "@/features/Game/types";
import { getQuestionById, setQuestion } from "./getQuestion";
import { getGameUsersPoints, increaseUserPoints } from "./statsResources";
import { generateTextWithAi } from "@/app/api/ai/generateTextWithAi";
import { AuthUserInfo } from "@/app/api/config/type";

export const submitAnswer = async ({
  data,
  userInfo,
}: {
  userInfo: AuthUserInfo;
  data: SubmitAnswerRequest;
}): Promise<SubmitAnswerResponse> => {
  const question = await getQuestionById({
    userId: userInfo.uid,
    gameQuestionId: data.questionId,
  });

  if (!question) {
    const updatedUserPoints = await getGameUsersPoints();
    const response: SubmitAnswerResponse = {
      isCorrect: false,
      updatedUserPoints,
      description: "Question not found or already answered.",
    };
    return response;
  }

  let updatedStats: GameUsersPoints | null = null;

  let isCorrect = false;
  let description = "";
  isCorrect = question?.correctAnswer === data.answer;
  const isImageDescriptionCorrect = question.type === "describe_image";
  if (isImageDescriptionCorrect && data.answer) {
    const answer = data.answer.trim();

    const languageToLearn = question.learningLanguage;
    const systemMessage = `You are an system - expert in language learning.
The user has provided a description of an image in the language they are learning (${languageToLearn}).
Your task is to determine if the description is at least somehow near the image context.
Image description is "${question.correctAnswer}"

If user's description is somehow correct, start your answer with "true|" (case-insensitive).
If user's description is absolutely incorrect, start your answer with "false|" (case-insensitive).

After that, provide a corrected version of user's description in ${languageToLearn} language.
After corrected description, provide a brief explanation of why the description is correct or incorrect.

Be polite and concise.
Address the explanation to the user, using "You" or "Your" in ${languageToLearn} language.
Then, if needed, provide a grammatically corrected version of the description in ${languageToLearn} language.
User will see your answer.

Structure your response like this:
[true|false]|Grammatically corrected user's description in ${languageToLearn} language.|Your explanation in ${languageToLearn} language.

Example of your response:
true|A group of people is seen singing a song.|Your description is correct because it captures the essence of a group of friends singing.  

`;
    console.log("systemMessage", systemMessage);
    const aiResult = await generateTextWithAi({
      systemMessage: systemMessage,
      userMessage: `User's description: "${answer}".`,
      model: "gpt-4o",
    });
    console.log("AI Result:", aiResult.output);

    isCorrect = aiResult.output.toLowerCase().trim().startsWith("true");
    console.log("aiResult.output", aiResult.output);
    const trimmedOutput = aiResult.output
      .trim()
      .replace(/^true/i, "")
      .replace(/^false/i, "")
      .trim()
      .replace(/^\|/, "");

    description = trimmedOutput || "No description provided by AI.";
  }

  const isTopicToDiscuss = question.type === "topic_to_discuss";
  if (isTopicToDiscuss && data.answer) {
    const answer = data.answer.trim();

    const languageToLearn = question.learningLanguage;
    const systemMessage = `You are an system - expert in language learning.
The user has provided his speech about topic (${question.correctAnswer}). The language they are learning (${languageToLearn}).
Your task is to determine if the speech is at least somehow near the topic.

If user's speech is somehow correct, start your answer with "true|" (case-insensitive).
If user's speech is absolutely incorrect, start your answer with "false|" (case-insensitive).

After that, provide a corrected version of user's speech in ${languageToLearn} language.
After corrected speech, provide a brief explanation of why the speech is correct or incorrect.

Be polite and concise.
Address the explanation to the user, using "You" or "Your" in ${languageToLearn} language.
Then, if needed, provide a grammatically corrected version of the speech in ${languageToLearn} language.
User will see your answer.

Structure your response like this:
[true|false]|Grammatically corrected user's speech in ${languageToLearn} language.|Your explanation in ${languageToLearn} language.

Example of your response:
true|A group of people is seen singing a song.|Your speech is correct because it captures the essence of a group of friends singing.  

`;
    console.log("systemMessage", systemMessage);
    const aiResult = await generateTextWithAi({
      systemMessage: systemMessage,
      userMessage: `User's description: "${answer}".`,
      model: "gpt-4o",
    });
    console.log("AI Result:", aiResult.output);

    isCorrect = aiResult.output.toLowerCase().trim().startsWith("true");
    console.log("aiResult.output", aiResult.output);
    const trimmedOutput = aiResult.output
      .trim()
      .replace(/^true/i, "")
      .replace(/^false/i, "")
      .trim()
      .replace(/^\|/, "");

    description = trimmedOutput || "No description provided by AI.";
  }

  if (isCorrect && question.answeredAt === null) {
    updatedStats = await increaseUserPoints({
      userId: userInfo.uid,
      points: 1,
    });

    setQuestion({
      userId: userInfo.uid,
      question: {
        ...question,
        isAnsweredCorrectly: isCorrect,
        answeredAt: Date.now(),
      },
    });
  }

  const updatedUserPoints = updatedStats || (await getGameUsersPoints());
  const response: SubmitAnswerResponse = {
    isCorrect,
    updatedUserPoints,
    description: description,
  };
  return response;
};
