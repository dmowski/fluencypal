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
import { GameAvatars, GameLastVisit, GameProfile, GameQuestionShort, UsersStat } from "./types";
import {
  getGameQuestionsRequest,
  getMyProfileRequest,
  getSortedStatsFromData,
  submitAnswerRequest,
  updateUserProfileRequest,
} from "@/features/Game/gameBackendRequests";

import { useSettings } from "../Settings/useSettings";
import { shuffleArray } from "@/libs/array";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { db } from "../Firebase/firebaseDb";
import { setDoc } from "firebase/firestore";
import { avatars } from "./avatars";

interface GameContextType {
  loadingProfile: boolean;
  stats: UsersStat[];
  myProfile: GameProfile | null;
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
  isGameWinner: boolean;
  updateUsername: (username: string) => Promise<void>;
  gameLastVisit: GameLastVisit | null;
  pointsToNextPosition: number | null;
  nextPositionStat: UsersStat | null;
  gameAvatars: GameAvatars;
  setAvatar: (avatarUrl: string) => void;

  isGamePlaying: boolean;
  playGame: () => void;
  stopGame: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

function useProvideGame(): GameContextType {
  const auth = useAuth();
  const settings = useSettings();
  const [myProfile, setMyProfile] = useState<GameProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questions, setQuestions] = useState<GameQuestionShort[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<GameQuestionShort | null>(null);
  const isUpdatingUsername = useRef(false);

  const nativeLanguageCode = settings.userSettings?.nativeLanguageCode || null;
  const [gameRate] = useDocumentData(db.documents.gameRate);
  const [gameLastVisit] = useDocumentData(db.documents.gameLastVisit);

  const [gameAvatars] = useDocumentData(db.documents.gameAvatars);

  const [isGamePlaying, setIsGamePlaying] = useState(false);

  const playGame = () => {
    generateQuestions();
    setIsGamePlaying(true);
  };
  const stopGame = () => {
    setIsGamePlaying(false);
  };

  const stats = useMemo(() => {
    if (!gameRate) return [];
    return getSortedStatsFromData(gameRate);
  }, [gameRate]);

  const updateLastVisit = async () => {
    if (!auth.uid || !myProfile?.username) return;
    const doc = db.documents.gameLastVisit;
    setDoc(
      doc,
      {
        [myProfile.username]: Date.now(),
      },
      { merge: true }
    );
  };

  const setAvatar = async (avatarUrl: string) => {
    if (!auth.uid || !myProfile?.username) return;

    const doc = db.documents.gameAvatars;

    await setDoc(
      doc,
      {
        [myProfile.username]: avatarUrl,
      },
      { merge: true }
    );
  };

  useEffect(() => {
    if (!auth.uid || !myProfile?.username || isUpdatingUsername.current) return;
    updateLastVisit();
    setDefaultAvatarIfNeeded();
  }, [auth.uid, myProfile?.username]);

  const setDefaultAvatarIfNeeded = async () => {
    if (!auth.uid || !myProfile?.username || !gameAvatars || isUpdatingUsername.current) return;

    const userAvatar = gameAvatars[myProfile.username];
    if (userAvatar) return; // Avatar already set

    const randomAvatars = shuffleArray(avatars);
    const randomAvatar = randomAvatars[0];
    if (!randomAvatar) return;
    await setAvatar(randomAvatar);
  };

  const userId = auth.uid;

  const getMyProfile = async () => {
    const response = await getMyProfileRequest(await auth.getToken());
    setMyProfile(response);
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
      //.filter((t) => t.type == "read_text")
      .filter((question) => !questions.some((q) => q.id === question.id));
    setQuestions(uniqQuestions);
    setActiveQuestion((prev) => {
      if (prev) return prev;
      const randomArray = shuffleArray(uniqQuestions);
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

  useEffect(() => {
    if (userId) {
      getMyProfile().then(async () => {
        setLoadingProfile(false);
      });
    }
  }, [userId]);

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

  const myPosition = useMemo(() => {
    if (!myProfile) return null;
    const myStat = stats.find((stat) => stat.username === myProfile.username);
    if (!myStat) return null;
    const myIndex = stats.findIndex((stat) => stat.username === myStat.username);
    return myIndex + 1;
  }, [myProfile, stats]);

  const nextPositionStat = useMemo(() => {
    if (!myProfile) return null;
    const myStat = stats.find((stat) => stat.username === myProfile.username);
    if (!myStat) return null;
    const myIndex = stats.findIndex((stat) => stat.username === myStat.username);
    if (myIndex - 1 < 0 || myIndex == -1) return null;
    return stats[myIndex - 1];
  }, [myProfile, stats]);

  const pointsToNextPosition = useMemo(() => {
    if (!nextPositionStat || !myProfile) return null;
    const myStat = stats.find((stat) => stat.username === myProfile.username);
    if (!myStat) return null;
    return nextPositionStat.points - myStat.points;
  }, [myProfile, nextPositionStat, stats]);

  const isTop5Position = useMemo(() => {
    if (!myProfile) return false;
    const myStat = stats.find((stat) => stat.username === myProfile.username);
    if (!myStat) return false;
    const myIndex = stats.findIndex((stat) => stat.username === myStat.username);
    return myIndex < 5;
  }, [myProfile, stats]);

  const updateUsername = async (username: string) => {
    if (!userId) return;

    isUpdatingUsername.current = true;

    const response = await updateUserProfileRequest(
      {
        username,
      },
      await auth.getToken()
    );

    if (response.isUpdated) {
      setMyProfile((prev) => {
        if (!prev) return null;
        return { ...prev, username };
      });
    } else {
      console.log("Failed to update username:", response.error);
      alert(response.error || "Failed to update username");
    }

    setTimeout(() => {
      isUpdatingUsername.current = false;
    }, 1000);
  };

  const myPoints = useMemo(() => {
    if (!myProfile) return null;
    const myStat = stats.find((stat) => stat.username === myProfile.username);
    if (!myStat) return null;
    return myStat.points;
  }, [myProfile, stats]);

  return {
    isGameWinner: isTop5Position,
    loadingProfile,
    myPosition,
    myPoints,
    nextQuestion,
    submitAnswer,
    myProfile,
    stats,
    questions,
    loadingQuestions,
    setAvatar,
    generateQuestions,
    activeQuestion,

    updateUsername,
    gameLastVisit: gameLastVisit || null,
    pointsToNextPosition: pointsToNextPosition || null,
    nextPositionStat: nextPositionStat || null,
    gameAvatars: gameAvatars || {},
    isGamePlaying,
    playGame,
    stopGame,
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
