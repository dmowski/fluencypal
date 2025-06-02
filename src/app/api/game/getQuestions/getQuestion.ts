import { GameQuestionFull, GameQuestionShort } from "@/features/Game/types";
import { getDB } from "../../config/firebase";
import { SupportedLanguage } from "@/features/Lang/lang";

interface getQuestionProps {
  userId: string;
  gameQuestionId: string;
}

export const getQuestionById = async ({ userId, gameQuestionId }: getQuestionProps) => {
  const db = getDB();
  const questionDoc = await db
    .collection("users")
    .doc(userId)
    .collection("gameQuestions")
    .doc(gameQuestionId)
    .get();
  if (!questionDoc.exists) {
    return null;
  }
  const data = questionDoc.data() as GameQuestionFull;
  return data;
};

interface setQuestionProps {
  userId: string;
  question: GameQuestionFull;
}

export const setQuestion = async ({ userId, question }: setQuestionProps) => {
  const db = getDB();
  const questionId = question.id;
  await db
    .collection("users")
    .doc(userId)
    .collection("gameQuestions")
    .doc(questionId)
    .set(question);
};

export const getUnansweredQuestions = async (
  userId: string,
  learningLanguage: SupportedLanguage
) => {
  const db = getDB();
  const questionsSnapshot = await db
    .collection("users")
    .doc(userId)
    .collection("gameQuestions")
    .where("answeredAt", "==", null)
    .get();

  const questions: GameQuestionFull[] = [];
  questionsSnapshot.forEach((doc) => {
    const data = doc.data() as GameQuestionFull;
    if (data.learningLanguage === learningLanguage) {
      questions.push(data);
    }
  });
  return questions;
};

export const convertFullQuestionToShort = (question: GameQuestionFull): GameQuestionShort => {
  const shortQuestion: GameQuestionShort = {
    id: question.id,
    type: question.type,
    question: question.question,
    options: question.options,
    imageUrl: question.imageUrl,
  };
  return shortQuestion;
};
