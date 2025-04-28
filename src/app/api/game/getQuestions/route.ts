import { validateAuthToken } from "../../config/firebase";
import { getUserAiInfo, getUserInfo } from "../../user/getUserInfo";
import { GetGameQuestionsRequest } from "../types";
import { generateRandomQuestions } from "./generateRandomQuestions";
import { setQuestion } from "./getQuestion";

export async function POST(request: Request) {
  const userInfo = await validateAuthToken(request);

  const fullUserInfo = await getUserInfo(userInfo.uid);
  const requestData = (await request.json()) as GetGameQuestionsRequest;
  const aiUserInfo = await getUserAiInfo(userInfo.uid);

  const nativeLanguage = requestData.nativeLanguageCode;
  const learningLanguage = fullUserInfo.languageCode || "en";
  const userInfoRecords = aiUserInfo?.records || [];

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
