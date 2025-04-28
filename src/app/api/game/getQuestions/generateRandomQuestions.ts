import { GameQuestionShort, GameQuestionFull } from "@/features/Game/types";
import { fullEnglishLanguageName, SupportedLanguage } from "@/features/Lang/lang";
import { generateTextWithAi } from "../../ai/generateTextWithAi";

interface QuestionOutput {
  fullQuestions: GameQuestionFull;
  shortQuestions: GameQuestionShort;
}

const getUserInfoForAi = ({
  userInfoRecords,
  nativeLanguage,
  learningLanguage,
}: generateRandomQuestionsProps): string => {
  const userInfo =
    userInfoRecords.length > 0 ? `Info about the user: ${userInfoRecords.join(", ")}` : "";

  const userNativeLanguage = `User's native language: ${fullEnglishLanguageName[nativeLanguage]}`;
  const userLearningLanguage = `User's learning language: ${fullEnglishLanguageName[learningLanguage]}`;

  const userInfoForAi = [userInfo, userNativeLanguage, userLearningLanguage]
    .filter(Boolean)
    .join("\n");
  return userInfoForAi;
};

const splitTextIntoSentences = (text: string): string[] => {
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences.map((sentence) => sentence.trim());
};

const splitSentenceIntoWords = (sentence: string): string[] => {
  const words = sentence.split(/\s+/);
  return words.map((word) => word.trim());
};

const generateWordsQuestions = async ({
  userInfoRecords,
  nativeLanguage,
  learningLanguage,
}: generateRandomQuestionsProps): Promise<QuestionOutput[]> => {
  const userInfo = getUserInfoForAi({
    userInfoRecords,
    nativeLanguage,
    learningLanguage,
  });

  const { output } = await generateTextWithAi({
    systemMessage: `You are system that should generate Language learning quiz.
Be creative and use different words from different parts of user's life.
Use only ${fullEnglishLanguageName[learningLanguage]} language for generate words.

Generate 10 words. Each word should be generated along with 4 translation options. First of them should be correct.
Do not wrap your answer in any intro or outro.

Example of your response:
Dog - пес, кошка, кот, зебра
Wolf - волк, стакан, лиса, медведь


`,
    userMessage: userInfo,
    model: "gpt-4o",
  });

  console.log("Words output");
  console.log(output);

  const lines = output.split("\n").filter((line) => line.trim().length > 0 && line.includes("-"));

  const allQuestions: QuestionOutput[] = lines.map((line, index) => {
    const wordAndOptions = line.split("-");
    const word = wordAndOptions[0]?.trim() || "";
    const options = wordAndOptions[1]?.split(",").map((option) => option.trim()) || [];

    const correctOption = options?.[0] || "";

    const shortQuestion: GameQuestionShort = {
      id: `${Date.now()}_word_${index}`,
      type: "translate",
      question: word,
      options: shuffleArray(options),
    };

    const fullQuestion: GameQuestionFull = {
      ...shortQuestion,
      createdAt: Date.now(),
      answeredAt: null,
      isAnsweredCorrectly: false,
      correctAnswer: correctOption,
    };
    return {
      fullQuestions: fullQuestion,
      shortQuestions: shortQuestion,
    };
  });

  return allQuestions;
};

const generateSentenceQuestions = async ({
  userInfoRecords,
  nativeLanguage,
  learningLanguage,
}: generateRandomQuestionsProps): Promise<QuestionOutput[]> => {
  const userInfo = getUserInfoForAi({
    userInfoRecords,
    nativeLanguage,
    learningLanguage,
  });

  const { output } = await generateTextWithAi({
    systemMessage: `You are system that should generate text to practice reading.
Be creative and use different words and different parts of user's life.
Use only ${fullEnglishLanguageName[learningLanguage]} language on your response.
Generate text within 10 sentences. Each sentence should be less than 7 words long.
Sentences should be grammatically correct and meaningful.
Do not wrap your answer in any intro or outro.
`,
    userMessage: userInfo,
    model: "gpt-4o",
  });

  const sentences = splitTextIntoSentences(output).filter((sentence) => sentence.trim().length > 3);

  const allQuestions: QuestionOutput[] = sentences.map((sentence, index) => {
    const shortQuestion: GameQuestionShort = {
      id: `${Date.now()}_sent_${index}`,
      type: "sentence",
      question: sentence,
      options: splitSentenceIntoWords(sentence),
    };

    const fullQuestion: GameQuestionFull = {
      ...shortQuestion,
      createdAt: Date.now(),
      answeredAt: null,
      isAnsweredCorrectly: false,
      correctAnswer: sentence,
    };
    return {
      fullQuestions: fullQuestion,
      shortQuestions: shortQuestion,
    };
  });

  return allQuestions;
};

interface generateRandomQuestionsProps {
  userInfoRecords: string[];
  nativeLanguage: SupportedLanguage;
  learningLanguage: SupportedLanguage;
}

const shuffleArray = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const generateRandomQuestions = async ({
  userInfoRecords,
  nativeLanguage,
  learningLanguage,
}: generateRandomQuestionsProps): Promise<QuestionOutput[]> => {
  const [sentenceQuestions, wordsQuestions] = await Promise.all([
    generateSentenceQuestions({
      userInfoRecords,
      nativeLanguage,
      learningLanguage,
    }),
    generateWordsQuestions({
      userInfoRecords,
      nativeLanguage,
      learningLanguage,
    }),
  ]);

  const questionsOutput: QuestionOutput[] = [...sentenceQuestions, ...wordsQuestions];
  const shuffledQuestions = shuffleArray(questionsOutput);
  return shuffledQuestions;
};
