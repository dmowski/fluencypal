import { AuthUserInfo } from "@/app/api/config/type";
import { GetGameQuestionsRequest, GetGameQuestionsResponse } from "../types";
import { getUserAiInfo, getUserInfo } from "@/app/api/user/getUserInfo";
import {
  convertFullQuestionToShort,
  getUnansweredQuestions,
  setQuestion,
} from "./getQuestion";
import { generateRandomQuestions } from "./generateRandomQuestions";

const alwaysGenerateQuestions = false; // Set to true to always generate questions

export const generateUsersQuestions = async ({
  userInfo,
  requestData,
}: {
  userInfo: AuthUserInfo;
  requestData: GetGameQuestionsRequest;
}): Promise<GetGameQuestionsResponse> => {
  const [fullUserInfo, aiUserInfo] = await Promise.all([
    getUserInfo(userInfo.uid),
    getUserAiInfo(userInfo.uid),
  ]);

  const nativeLanguage = requestData.nativeLanguageCode;
  const learningLanguage = fullUserInfo.languageCode || "en";
  const userInfoRecords = aiUserInfo?.records || [];

  const unansweredQuestions = await getUnansweredQuestions(
    userInfo.uid,
    learningLanguage,
  );
  if (unansweredQuestions.length > 10 && !alwaysGenerateQuestions) {
    const responseData = unansweredQuestions.map((question) =>
      convertFullQuestionToShort(question),
    );
    return responseData;
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

  const responseData = generatedQuestions.map(
    (question) => question.shortQuestions,
  );
  return responseData;
};
