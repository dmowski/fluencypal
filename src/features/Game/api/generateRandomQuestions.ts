import { GameQuestionShort, GameQuestionFull } from "@/features/Game/types";
import { fullEnglishLanguageName, SupportedLanguage } from "@/features/Lang/lang";
import { generateTextWithAi } from "../../../app/api/ai/generateTextWithAi";
import { shuffleArray } from "@/libs/array";
import { imageDescriptions } from "@/features/Game/ImagesDescriptions";

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

const generateImageQuestions = async ({
  userInfoRecords,
  nativeLanguage,
  learningLanguage,
}: generateRandomQuestionsProps): Promise<QuestionOutput[]> => {
  const allQuestions: QuestionOutput[] = imageDescriptions.map((image) => {
    const shortQuestion: GameQuestionShort = {
      id: `${Date.now()}_img_${image.id}`,
      type: "describe_image",
      question: image.shortDescription,
      imageUrl: image.url,
      options: [],
    };

    const fullQuestion: GameQuestionFull = {
      ...shortQuestion,
      createdAt: Date.now(),
      answeredAt: null,
      isAnsweredCorrectly: null,
      learningLanguage: learningLanguage,
      correctAnswer: image.fullImageDescription,
    };
    return {
      fullQuestions: fullQuestion,
      shortQuestions: shortQuestion,
    };
  });
  return allQuestions;
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
  const isSameLanguage = nativeLanguage === learningLanguage;
  const { output } = await generateTextWithAi({
    systemMessage: `You are system that should generate Language learning quiz.
Be creative and use different words from different parts of user's life.
Use only ${fullEnglishLanguageName[learningLanguage]} language for generate words.

Generate 20 words.
Each word should be generated along with 4 ${isSameLanguage ? "synonyms" : "translation"} options. First of them should be correct.
Do not wrap your answer in any intro or outro.

Example of your response:
* Dog - ${isSameLanguage ? "animal, bird, helicopter" : "пес, кошка, кот, зебра"}
* Wolf - ${isSameLanguage ? "animal, bird, helicopter" : "волк, стакан, лиса, медведь"}


Format of your response:
* Word - option1, option2, option3, option4

Strictly follow the formate, because it will be parsed by the code.
`,
    userMessage: userInfo,
    model: "gpt-4o",
  });

  console.log("Words output");
  console.log(output);

  const lines = output.split("\n").filter((line) => line.trim().length > 0 && line.includes("-"));

  const allQuestions: QuestionOutput[] = lines.map((line, index) => {
    const wordAndOptions = line.split("-");
    let word = wordAndOptions[0]?.trim() || "";
    word = word.replace(/[*]/g, "").trim(); // Remove any asterisks if present
    // remove start number if present
    word = word.replace(/^\d+\.\s*/, "").trim(); // Remove any leading numbers and dots

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
      isAnsweredCorrectly: null,
      learningLanguage: learningLanguage,
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
    systemMessage: `You should generate an imaginary story.
Be creative and use words that will be easy to understand to user.
Use only ${fullEnglishLanguageName[learningLanguage]} language on your response.
Generate text within 5 sentences. Each sentence should be less than 7 words long.
Sentences should be grammatically correct and meaningful.
Do not wrap your answer in any intro text.
`,
    userMessage: userInfo,
    model: "gpt-4o",
  });
  console.log("Sentences output");
  console.log(output);
  console.log("-----------------------------------");

  const sentences = splitTextIntoSentences(output).filter((sentence) => sentence.trim().length > 3);

  const allQuestions: QuestionOutput[] = sentences.map((sentence, index) => {
    const shortQuestion: GameQuestionShort = {
      id: `${Date.now()}_sent_${index}`,
      type: "sentence",
      question: sentence,
      options: shuffleArray(splitSentenceIntoWords(sentence)),
    };

    const fullQuestion: GameQuestionFull = {
      ...shortQuestion,
      createdAt: Date.now(),
      answeredAt: null,
      learningLanguage: learningLanguage,
      isAnsweredCorrectly: null,
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

export const generateRandomQuestions = async ({
  userInfoRecords,
  nativeLanguage,
  learningLanguage,
}: generateRandomQuestionsProps): Promise<QuestionOutput[]> => {
  const questions = await Promise.all([
    generateImageQuestions({
      userInfoRecords,
      nativeLanguage,
      learningLanguage,
    }),
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

  const questionsOutput: QuestionOutput[] = questions.flat();
  const shuffledQuestions = shuffleArray(questionsOutput);
  return shuffledQuestions;
};
