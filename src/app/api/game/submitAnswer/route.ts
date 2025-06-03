import { GameUsersPoints, SubmitAnswerRequest, SubmitAnswerResponse } from "@/features/Game/types";
import { validateAuthToken } from "../../config/firebase";
import { getQuestionById, setQuestion } from "../../../../features/Game/api/getQuestion";
import {
  getGameUsersPoints,
  increaseUserPoints,
} from "../../../../features/Game/api/statsResources";
import { getGameProfile } from "../../../../features/Game/api/getGameProfile";
import { generateTextWithAi } from "../../ai/generateTextWithAi";

export async function POST(request: Request) {
  const userInfo = await validateAuthToken(request);

  const data = (await request.json()) as SubmitAnswerRequest;

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
    return Response.json(response);
  }

  let updatedStats: GameUsersPoints | null = null;

  const isImageDescriptionCorrect = question.type === "describe_image";
  let isCorrect = false;
  let description = "";

  if (isImageDescriptionCorrect && data.answer) {
    const answer = data.answer.trim();

    const languageToLearn = question.learningLanguage;
    const systemMessage = `You are an system - expert in language learning.
The user has provided a description of an image in the language they are learning (${languageToLearn}).
Your task is to determine if the description is near the image context.
Real image description is "${question.correctAnswer}"

If user's description is somehow correct, start your answer with "true|" (case-insensitive).
If user's description is completely incorrect, start your answer with "false|" (case-insensitive).

After that, provide a brief explanation (1 short sentence using ${languageToLearn} language) of why the description is correct or incorrect.
Be polite and concise.
Address the explanation to the user, using "You" or "Your" in ${languageToLearn} language.
Then, if needed, provide a grammatically corrected version of the description in ${languageToLearn} language.
User will see your answer.

`;
    console.log("systemMessage", systemMessage);
    const aiResult = await generateTextWithAi({
      systemMessage: systemMessage,
      userMessage: `User's description: "${answer}".`,
      model: "gpt-4o",
    });
    console.log("AI Result:", aiResult.output);

    isCorrect = aiResult.output.toLowerCase().trim().startsWith("true");
    const trimmedOutput = aiResult.output
      .trim()
      .replace(/^true/i, "")
      .replace(/^false/i, "")
      .trim()
      .replace(/^\|/, "");
    description = trimmedOutput || "No description provided by AI.";
  } else {
    isCorrect = question?.correctAnswer === data.answer;
  }

  if (isCorrect && question.answeredAt === null) {
    const gameProfile = await getGameProfile(userInfo.uid);
    if (gameProfile) {
      updatedStats = await increaseUserPoints({
        username: gameProfile.username,
        points: 1,
      });
    }

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
  return Response.json(response);
}
