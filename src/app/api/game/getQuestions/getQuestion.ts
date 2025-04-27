import { GameQuestionFull } from "@/features/Game/types";
import { getDB } from "../../config/firebase";

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
