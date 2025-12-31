"use client";
import {
  createContext,
  useContext,
  ReactNode,
  JSX,
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useAuth } from "../Auth/useAuth";
import {
  GameAvatars,
  GameLastVisit,
  GameQuestionShort,
  GameUserNames,
  GameUsersAchievements,
  UsersStat,
} from "./types";
import {
  getGameQuestionsRequest,
  getSortedStatsFromData,
  resetGamePointsRequest,
  submitAnswerRequest,
} from "@/features/Game/gameBackendRequests";

import { useSettings } from "../Settings/useSettings";
import { shuffleArray } from "@/libs/array";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { db } from "../Firebase/firebaseDb";
import { setDoc } from "firebase/firestore";
import { avatars } from "./avatars";
import { generateRandomUsername } from "./userNames";

interface GameContextType {
  stats: UsersStat[];
  loadingQuestions: boolean;
  generateQuestions: () => Promise<void>;
  questions: GameQuestionShort[];
  activeQuestion: GameQuestionShort | null;
  submitAnswer: (
    questionId: string,
    answer: string
  ) => Promise<{ isCorrect: boolean; description: string | null }>;
  nextQuestion: () => void;
  myPosition: number | null;
  myPoints: number | null;
  isLoading: boolean;
  isGameWinner: boolean;
  updateUsername: (username: string) => Promise<void>;
  gameLastVisit: GameLastVisit | null;
  pointsToNextPosition: number | null;
  nextPositionStat: UsersStat | null;
  gameAvatars: GameAvatars;
  userAchievements: GameUsersAchievements;
  setAvatar: (avatarUrl: string) => void;

  isGamePlaying: boolean;
  playGame: () => void;
  stopGame: () => void;
  userNames: GameUserNames | null;

  myUserName: string | null;
  myAvatar: string;

  getRealPosition: (userId: string) => number;
}

const GameContext = createContext<GameContextType | null>(null);

function useProvideGame(): GameContextType {
  const auth = useAuth();
  const userId = auth.uid;
  const settings = useSettings();
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questions, setQuestions] = useState<GameQuestionShort[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<GameQuestionShort | null>(null);

  const nativeLanguageCode = settings.userSettings?.nativeLanguageCode || null;
  const [gameRate, gameRateLoading] = useDocumentData(db.documents.gameRate2);
  const [gameLastVisit, gameLastVisitLoading] = useDocumentData(db.documents.gameLastVisit2);
  const [gameAvatars, gameAvatarsLoading] = useDocumentData(db.documents.gameAvatars2);
  const [userNames, userNamesLoading] = useDocumentData(db.documents.gameUserNames2);
  const [userAchievements, userAchievementsLoading] = useDocumentData(
    db.documents.gameUserAchievements2
  );
  const isLoading =
    gameRateLoading ||
    gameLastVisitLoading ||
    gameAvatarsLoading ||
    userNamesLoading ||
    userAchievementsLoading;
  const [isGamePlaying, setIsGamePlaying] = useState(false);

  const myAvatar = gameAvatars?.[userId || ""] || "";

  const playGame = () => {
    generateQuestions();
    setIsGamePlaying(true);
  };
  const stopGame = () => {
    setIsGamePlaying(false);
    setActiveQuestion(null);
  };

  const stats = useMemo(() => {
    if (!gameRate) return [];
    return getSortedStatsFromData(gameRate);
  }, [gameRate]);

  const updateLastVisit = async () => {
    if (!userId) return;
    const doc = db.documents.gameLastVisit2;
    setDoc(
      doc,
      {
        [userId]: new Date().toISOString(),
      },
      { merge: true }
    );
  };

  const setAvatar = async (avatarUrl: string) => {
    if (!userId) return;
    const doc = db.documents.gameAvatars2;
    await setDoc(
      doc,
      {
        [userId]: avatarUrl,
      },
      { merge: true }
    );
  };

  useEffect(() => {
    if (!userId) return;
    updateLastVisit();
    setDefaultAvatarIfNeeded();
    setDefaultUsernameIfNeeded();
    resetPointsIfNeeded();
  }, [userId, isLoading]);

  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(() => {
      updateLastVisit();
    }, 60_000);
    return () => clearInterval(interval);
  }, [userId]);

  const setDefaultUsernameIfNeeded = async () => {
    if (!userId || isLoading || !userNames) return;

    const userName = userNames[userId];
    if (userName) return; // Username already set

    const randomUsername = generateRandomUsername();
    if (!randomUsername) return;
    await updateUsername(randomUsername);
  };

  const resetPointsIfNeeded = async () => {
    if (!userId || isLoading || !gameAvatars) return;
    if (myAvatar) return; // Avatar already set
    await resetGamePointsRequest();
  };

  const setDefaultAvatarIfNeeded = async () => {
    if (!userId || isLoading || !gameAvatars) return;
    if (myAvatar) return; // Avatar already set

    const randomAvatars = shuffleArray(avatars);
    const randomAvatar = randomAvatars[0];
    if (!randomAvatar) return;
    await setAvatar(randomAvatar);
  };

  const loadMoreQuestions = async () => {
    if (!nativeLanguageCode) {
      return;
    }

    const generatedQuestions = await getGameQuestionsRequest(
      {
        nativeLanguageCode,
      },
      await auth.getToken()
    );

    const uniqQuestions = generatedQuestions
      //.filter((t) => t.type == "translate")
      .filter((question) => !questions.some((q) => q.id === question.id));
    const allQuestionsIds = [...questions, ...uniqQuestions];
    setQuestions(allQuestionsIds);
    setActiveQuestion((prev) => {
      if (prev) return prev;
      const randomArray = shuffleArray(allQuestionsIds);
      const nextQuestion = randomArray[0] || null;
      return nextQuestion;
    });
  };

  const generateQuestions = async () => {
    setLoadingQuestions(true);
    await loadMoreQuestions();
    setLoadingQuestions(false);
    updateLastVisit();
  };

  const submitAnswer = async (questionId: string, answer: string) => {
    const response = await submitAnswerRequest(
      {
        questionId,
        answer,
      },
      await auth.getToken()
    );
    const isCorrect = response.isCorrect;
    const description = response.description;
    if (isCorrect) {
      const newQuestions = questions.filter((question) => question.id !== questionId);
      setQuestions(newQuestions);
      const isFewQuestions = newQuestions.length < 10;
      if (isFewQuestions) {
        loadMoreQuestions();
      }
    }
    updateLastVisit();
    return { isCorrect, description };
  };

  const nextQuestion = () => {
    const randomArray = shuffleArray(questions).filter(
      (question) => question.id !== activeQuestion?.id
    );
    const nextQuestion = randomArray[0] || null;
    setActiveQuestion(nextQuestion);
  };

  const myStats = useMemo(() => {
    if (!userId) return null;
    const myStat = stats.find((stat) => stat.userId === userId);
    if (!myStat) return null;
    return myStat;
  }, [userId, stats]);

  const myIndex = useMemo(() => {
    if (!myStats) return null;
    const myIndex = stats.findIndex((stat) => stat.userId === myStats.userId);
    if (myIndex === -1) return null;
    return myIndex;
  }, [myStats, stats]);

  const myPosition = useMemo(() => {
    return myIndex === null ? null : myIndex + 1;
  }, [myIndex]);

  const nextPositionStat = useMemo(() => {
    if (myIndex === null) return null;
    if (myIndex - 1 < 0 || myIndex == -1) return null;
    return stats[myIndex - 1];
  }, [myIndex, stats]);

  const pointsToNextPosition = useMemo(() => {
    if (!nextPositionStat || !myStats) return null;
    return nextPositionStat.points - myStats.points;
  }, [nextPositionStat, myStats]);

  const isTop5Position = myIndex !== null && myIndex < 5;

  const updateUsername = async (username: string) => {
    if (!userId || !userNames) return;

    const doc = db.documents.gameUserNames2;
    await setDoc(
      doc,
      {
        [userId]: username,
      },
      { merge: true }
    );
  };

  const myPoints = myStats !== null ? myStats.points : null;
  const myUserName = userNames?.[userId || ""] || null;

  const getRealPosition = (userId: string) => {
    const index = stats.findIndex((stat) => stat.userId === userId);
    return index >= 0 ? index : 0;
  };

  return {
    myUserName,
    isGameWinner: isTop5Position,
    myPosition,
    userNames: userNames || null,
    myPoints,
    nextQuestion,
    submitAnswer,
    stats,
    questions,
    loadingQuestions,
    setAvatar,
    generateQuestions,
    activeQuestion,
    getRealPosition,

    updateUsername,
    gameLastVisit: gameLastVisit || null,
    pointsToNextPosition: pointsToNextPosition || null,
    nextPositionStat: nextPositionStat || null,
    gameAvatars: gameAvatars || {},
    userAchievements: userAchievements || {},
    isGamePlaying,
    playGame,
    stopGame,
    myAvatar,
    isLoading,
  };
}

export function GameProvider({ children }: { children: ReactNode }): JSX.Element {
  const hook = useProvideGame();
  return <GameContext.Provider value={hook}>{children}</GameContext.Provider>;
}

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a UsageProvider");
  }
  return context;
};
