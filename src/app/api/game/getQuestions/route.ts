import { GetGameQuestionsRequest } from "@/features/Game/types";
import { validateAuthToken } from "../../config/firebase";
import { getUserAiInfo, getUserInfo } from "../../user/getUserInfo";
import { generateRandomQuestions } from "../../../../features/Game/api/generateRandomQuestions";
import {
  convertFullQuestionToShort,
  getUnansweredQuestions,
  setQuestion,
} from "../../../../features/Game/api/getQuestion";

const alwaysGenerateQuestions = false; // Set to true to always generate questions
export async function POST(request: Request) {
  const userInfo = await validateAuthToken(request);

  const fullUserInfo = await getUserInfo(userInfo.uid);
  const requestData = (await request.json()) as GetGameQuestionsRequest;
  const aiUserInfo = await getUserAiInfo(userInfo.uid);

  const nativeLanguage = requestData.nativeLanguageCode;
  const learningLanguage = fullUserInfo.languageCode || "en";
  const userInfoRecords = aiUserInfo?.records || [];

  const unansweredQuestions = await getUnansweredQuestions(userInfo.uid, learningLanguage);
  if (unansweredQuestions.length > 5 && !alwaysGenerateQuestions) {
    const responseData = unansweredQuestions.map((question) =>
      convertFullQuestionToShort(question)
    );
    return Response.json(responseData);
  }

  const generatedQuestions = await generateRandomQuestions({
    userInfoRecords,
    nativeLanguage,
    learningLanguage,
  });

  await Promise.all([
    generatedQuestions.map(async (question) => {
      setQuestion({
        userId: userInfo.uid,
        question: question.fullQuestions,
      });
    }),
  ]);

  const responseData = generatedQuestions.map((question) => question.shortQuestions);
  return Response.json(responseData);
}
