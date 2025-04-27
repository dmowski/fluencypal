import { validateAuthToken } from "../../config/firebase";
import { getQuestionById, setQuestion } from "../getQuestions/getQuestion";
import { getGameUsersPoints, increaseUserPoints } from "../getStats/resources";
import { getGameProfile } from "../profile/getGameProfile";
import { SubmitAnswerRequest, SubmitAnswerResponse } from "../types";

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
    };
    return Response.json(response);
  }

  const isCorrect = question?.correctAnswer === data.answer;

  if (isCorrect) {
    const gameProfile = await getGameProfile(userInfo.uid);
    if (gameProfile) {
      await increaseUserPoints({
        username: gameProfile.username,
        points: 1,
      });
    }
  }

  setQuestion({
    userId: userInfo.uid,
    question: {
      ...question,
      isAnsweredCorrectly: isCorrect,
      answeredAt: Date.now(),
    },
  });

  const updatedUserPoints = await getGameUsersPoints();
  const response: SubmitAnswerResponse = {
    isCorrect,
    updatedUserPoints,
  };
  return Response.json(response);
}
